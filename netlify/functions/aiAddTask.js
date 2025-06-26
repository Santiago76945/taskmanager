// netlify/functions/aiAddTask.js

require('dotenv').config()
const jwt = require('jsonwebtoken')
const { connectToDB } = require('./dbConnection')
const User = require('./models/User')
const Task = require('./models/Task')
const { OpenAI } = require('openai')
// Para contar tokens según el modelo
const { encoding_for_model } = require('@dqbd/tiktoken')

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// Máximo de tokens que permitimos en la respuesta JSON
const MAX_TOKENS = 200

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
    if (!auth) return { statusCode: 401, body: 'No autorizado' }
    let payload
    try {
        payload = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET)
    } catch (jwtErr) {
        console.error('Token inválido:', jwtErr)
        return { statusCode: 403, body: 'Token inválido' }
    }
    const userId = payload.userId

    // — cargar usuario y saldo
    const user = await User.findById(userId)
    if (!user) return { statusCode: 404, body: 'Usuario no encontrado' }

    // — factor de conversión
    const coinsPerToken = parseFloat(process.env.COINS_PER_TOKEN ?? process.env.VITE_COINS_PER_TOKEN) || 0

    // — preparar mensajes
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
        return { statusCode: 400, body: JSON.stringify({ msg: 'Falta campo instruction' }) }
    }

    const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: instruction }
    ]

    // — preview: contar tokens prompt + MAX_TOKENS
    const isPreview = event.queryStringParameters?.preview === 'true'
    if (isPreview) {
        const enc = encoding_for_model('gpt-4o')
        let promptTokens = 0
        for (const msg of messages) {
            promptTokens += enc.encode(msg.content).length
        }
        enc.free()

        const totalTokens = promptTokens + MAX_TOKENS
        const estimatedCost = totalTokens * coinsPerToken

        return {
            statusCode: 200,
            body: JSON.stringify({
                promptTokens,
                maxTokens: MAX_TOKENS,
                coinsPerToken,
                actualCost: estimatedCost
            })
        }
    }

    // — saldo mínimo estimado (al menos un token)
    if (user.demiCoins < coinsPerToken) {
        return {
            statusCode: 402,
            body: JSON.stringify({ msg: 'Saldo insuficiente', demiCoins: user.demiCoins })
        }
    }

    // — llamada a OpenAI con límite de salida
    let resp
    try {
        resp = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages,
            max_tokens: MAX_TOKENS
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

    // — calcular tokens usados y coste real
    const usedTokens = resp.usage?.total_tokens ?? 0
    const actualCost = usedTokens * coinsPerToken

    if (actualCost > user.demiCoins) {
        return {
            statusCode: 402,
            body: JSON.stringify({ msg: 'Saldo insuficiente para esta operación', demiCoins: user.demiCoins })
        }
    }

    // — extraer JSON puro de la respuesta
    const content = resp.choices[0].message.content
    const first = content.indexOf('{')
    const last = content.lastIndexOf('}')
    if (first === -1 || last === -1) {
        return {
            statusCode: 500,
            body: JSON.stringify({ msg: 'No se encontró JSON en la respuesta de IA', raw: content })
        }
    }
    const jsonString = content.slice(first, last + 1)

    // — parsear y defaults
    let taskData
    try {
        taskData = JSON.parse(jsonString)
    } catch (jsonErr) {
        console.error('Error parseando JSON extraído:', jsonErr)
        return {
            statusCode: 500,
            body: JSON.stringify({ msg: 'Respuesta IA no es JSON válido', raw: jsonString })
        }
    }
    if (!taskData.status) taskData.status = 'no comenzada'

    // — guardar tarea y descontar monedas
    const newTask = new Task({ userId, ...taskData })
    await newTask.save()
    user.demiCoins -= actualCost
    await user.save()

    // — responder con la tarea y nuevo saldo
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
