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

    await connectToDB()

    // — Autenticación
    const auth = event.headers.authorization
    if (!auth) return { statusCode: 401, body: 'No autorizado' }
    let payload
    try {
        payload = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET)
    } catch {
        return { statusCode: 403, body: 'Token inválido' }
    }
    const userId = payload.userId

    // — Cargar usuario y saldo
    const user = await User.findById(userId)
    if (!user) return { statusCode: 404, body: 'Usuario no encontrado' }

    // — Verificar saldo mínimo estimado
    const coinsPerToken = parseFloat(process.env.COINS_PER_TOKEN) || 0
    const EST_TOKENS = 10
    const costEst = EST_TOKENS * coinsPerToken
    if (user.demiCoins < costEst) {
        return {
            statusCode: 402,
            body: JSON.stringify({ msg: 'Saldo insuficiente', demiCoins: user.demiCoins })
        }
    }

    // — Preparar prompt para generar JSON **válido**
    const { instruction } = JSON.parse(event.body)
    const systemPrompt = [
        `Eres Demetria, el asistente de tareas. A partir de la solicitud del usuario debes generar un **objeto JSON** con la nueva tarea.`,
        `Incluye únicamente estas claves: title, status, deadline, priority, location, assignedBy, recommendedDate, creationDate, depends, dependsOn, stalledReason, observation, details, tag.`,
        `Para "status" usa solo uno de: "no comenzada", "comenzada", "estancada", "finalizada".`,
        `Para "priority" usa solo uno de: "baja", "media", "alta".`,
        `Los campos date (deadline, recommendedDate, creationDate) deben ir en formato ISO 8601.`,
        `Devuelve únicamente el objeto JSON, sin ningún otro texto.`
    ].join(' ')

    const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: instruction }
    ]

    // — Llamada a OpenAI (GPT-4o)
    const resp = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages
    })

    const content = resp.choices[0].message.content.trim()

    // — Parsear respuesta JSON
    let taskData
    try {
        taskData = JSON.parse(content)
    } catch {
        return {
            statusCode: 500,
            body: JSON.stringify({
                msg: 'Respuesta IA no es JSON válido',
                raw: content
            })
        }
    }

    // — Crear la tarea en la base de datos
    const newTask = new Task({ userId, ...taskData })
    await newTask.save()

    // — Descontar monedas según uso real
    const used = resp.usage?.total_tokens ?? EST_TOKENS
    const actualCost = used * coinsPerToken
    user.demiCoins -= actualCost
    await user.save()

    // — Responder con la tarea creada y el nuevo saldo
    return {
        statusCode: 201,
        body: JSON.stringify({
            task: newTask,
            demiCoins: user.demiCoins
        })
    }
}
