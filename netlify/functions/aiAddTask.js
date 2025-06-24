// netlify/functions/aiAddTask.js

require('dotenv').config()
const jwt = require('jsonwebtoken')
const { connectToDB } = require('./dbConnection')
const User = require('./models/User')
const Task = require('./models/Task')
const { OpenAI } = require('openai')

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' }
    }

    // — conectar a MongoDB
    try {
        await connectToDB()
    } catch (dbErr) {
        console.error('Error conectando a la DB:', dbErr)
        return {
            statusCode: 500,
            body: JSON.stringify({
                msg: 'Error de conexión a la base de datos',
                error: dbErr.message
            })
        }
    }

    // — verificar JWT
    const auth = event.headers.authorization
    if (!auth) {
        return { statusCode: 401, body: 'No autorizado' }
    }
    let payload
    try {
        payload = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET)
    } catch (jwtErr) {
        console.error('Token inválido:', jwtErr)
        return { statusCode: 403, body: 'Token inválido' }
    }
    const userId = payload.userId

    // — cargar usuario
    const user = await User.findById(userId)
    if (!user) {
        return { statusCode: 404, body: 'Usuario no encontrado' }
    }

    // — comprobar saldo mínimo estimado
    const coinsPerToken = parseFloat(process.env.COINS_PER_TOKEN) || 0
    const EST_TOKENS = 10
    const costEst = EST_TOKENS * coinsPerToken
    if (user.demiCoins < costEst) {
        return {
            statusCode: 402,
            body: JSON.stringify({
                msg: 'Saldo insuficiente',
                demiCoins: user.demiCoins
            })
        }
    }

    // — parsear body
    let body
    try {
        body = JSON.parse(event.body)
    } catch (parseErr) {
        console.error('JSON inválido en request:', parseErr)
        return {
            statusCode: 400,
            body: JSON.stringify({
                msg: 'Body JSON inválido',
                error: parseErr.message
            })
        }
    }
    const { instruction } = body
    if (!instruction) {
        return {
            statusCode: 400,
            body: JSON.stringify({ msg: 'Falta campo instruction' })
        }
    }

    // — preparar prompt (especificar enums permitidos)
    const systemPrompt = [
        `Eres Demetria, el asistente de tareas. A partir de la solicitud del usuario debes generar un objeto JSON con la nueva tarea.`,
        `Solo incluye las claves: title, status, deadline, priority, location, assignedBy, recommendedDate, creationDate, depends, dependsOn, stalledReason, observation, details, tag.`,
        `Para "status" usa uno de: "no comenzada", "comenzada", "estancada", "finalizada".`,
        `Para "priority" usa uno de: "baja", "media", "alta".`,
        `Campos de fecha (deadline, recommendedDate, creationDate) en formato ISO 8601.`,
        `Devuelve únicamente el JSON, sin texto adicional.`
    ].join(' ')

    const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: instruction }
    ]

    // — llamar a OpenAI con GPT-4o
    let resp
    try {
        resp = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages
        })
    } catch (openaiErr) {
        console.error('Error de OpenAI:', openaiErr)
        return {
            statusCode: 500,
            body: JSON.stringify({
                msg: 'Error generando respuesta de IA',
                error: openaiErr.message
            })
        }
    }

    let content = resp.choices?.[0]?.message?.content || ''
    console.log('Respuesta IA cruda:', content)

    // — extraer sólo lo que está dentro de la primera '{' y la última '}'
    const first = content.indexOf('{')
    const last = content.lastIndexOf('}')
    if (first === -1 || last === -1) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                msg: 'No se encontró JSON en la respuesta de IA',
                raw: content
            })
        }
    }
    const jsonString = content.slice(first, last + 1)

    // — parsear JSON extraído
    let taskData
    try {
        taskData = JSON.parse(jsonString)
    } catch (jsonErr) {
        console.error('Error parseando JSON extraído:', jsonErr, jsonString)
        return {
            statusCode: 500,
            body: JSON.stringify({
                msg: 'Respuesta IA no es JSON válido',
                raw: jsonString
            })
        }
    }

    // — crear tarea en MongoDB
    let newTask
    try {
        newTask = new Task({ userId, ...taskData })
        await newTask.save()
    } catch (dbSaveErr) {
        console.error('Error guardando tarea:', dbSaveErr)
        return {
            statusCode: 500,
            body: JSON.stringify({
                msg: 'Error guardando la tarea',
                error: dbSaveErr.message
            })
        }
    }

    // — descontar monedas según uso real
    const usedTokens = resp.usage?.total_tokens ?? EST_TOKENS
    user.demiCoins -= usedTokens * coinsPerToken
    await user.save()

    // — responder con la nueva tarea y saldo actualizado
    return {
        statusCode: 201,
        body: JSON.stringify({
            task: newTask,
            demiCoins: user.demiCoins
        })
    }
}
