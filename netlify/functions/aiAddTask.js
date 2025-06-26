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

    // — Conectar a MongoDB
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

    // — Verificar JWT
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

    // — Cargar usuario y saldo
    const user = await User.findById(userId)
    if (!user) {
        return { statusCode: 404, body: 'Usuario no encontrado' }
    }

    // — Lectura unificada del factor coinsPerToken
    const coinsPerToken = parseFloat(
        process.env.COINS_PER_TOKEN ?? process.env.VITE_COINS_PER_TOKEN
    ) || 0

    // — Comprobar saldo mínimo estimado
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

    // — Parsear body
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

    // — Preparar prompt para OpenAI
    const systemPrompt = [
        `Eres Demetria, el asistente de tareas. A partir de la solicitud del usuario debes generar un objeto JSON con la nueva tarea.`,
        `Solo incluye estas claves: title, status, deadline, priority, location, assignedBy, recommendedDate, creationDate, observation, details, tag.`,
        `Si status falta, lo pondrás como "no comenzada".`,
        `Para status usa uno de: "no comenzada", "comenzada", "estancada", "finalizada".`,
        `Para priority usa uno de: "baja", "media", "alta".`,
        `Para tag, intenta seleccionar "personal" o "laboral" según el contexto; solo si el usuario lo menciona explícitamente, utiliza otro valor.`,
        `Los campos de fecha (deadline, recommendedDate, creationDate) deben ir en formato ISO 8601.`,
        `Devuelve únicamente el objeto JSON, sin texto adicional.`
    ].join(' ')
    const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: instruction }
    ]

    // — Llamada a OpenAI
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

    // — Calcular coste real
    const usedTokens = resp.usage?.total_tokens ?? EST_TOKENS
    const actualCost = usedTokens * coinsPerToken

    // — Modo preview: devolver coste sin crear ni descontar
    const isPreview = event.queryStringParameters?.preview === 'true'
    if (isPreview) {
        return {
            statusCode: 200,
            body: JSON.stringify({ actualCost, usedTokens, coinsPerToken })
        }
    }

    // — Extraer JSON de la respuesta
    const content = resp.choices[0].message.content
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

    // — Parsear y aplicar defaults
    let taskData
    try {
        taskData = JSON.parse(jsonString)
    } catch (jsonErr) {
        console.error('Error parseando JSON extraído:', jsonErr)
        return {
            statusCode: 500,
            body: JSON.stringify({
                msg: 'Respuesta IA no es JSON válido',
                raw: jsonString
            })
        }
    }
    if (!taskData.status) taskData.status = 'no comenzada'

    // — Crear tarea y descontar monedas
    const newTask = new Task({ userId, ...taskData })
    await newTask.save()
    user.demiCoins -= actualCost
    await user.save()

    // — Responder con tarea y saldo
    return {
        statusCode: 201,
        body: JSON.stringify({
            task: newTask,
            demiCoins: user.demiCoins,
            usedTokens,
            coinsPerToken,
            actualCost
        })
    }
}
