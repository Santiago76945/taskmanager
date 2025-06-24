// netlify/functions/aiQuery.js

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

    // Autenticación
    const auth = event.headers.authorization
    if (!auth) return { statusCode: 401, body: 'No autorizado' }
    let payload
    try {
        payload = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET)
    } catch {
        return { statusCode: 403, body: 'Token inválido' }
    }
    const userId = payload.userId

    // Carga usuario y saldo
    const user = await User.findById(userId)
    if (!user) return { statusCode: 404, body: 'Usuario no encontrado' }

    // Calcular coste estimado
    const coinsPerToken = parseFloat(process.env.COINS_PER_TOKEN) || 0
    const EST_TOKENS = 10
    const costEst = EST_TOKENS * coinsPerToken
    if (user.demiCoins < costEst) {
        return {
            statusCode: 402,
            body: JSON.stringify({ msg: 'Saldo insuficiente', demiCoins: user.demiCoins })
        }
    }

    // Obtener tareas y montar prompt
    const tasks = await Task.find({ userId }).sort('deadline')
    const { prompt } = JSON.parse(event.body)
    const messages = [
        {
            role: 'system',
            content:
                'Eres Demetria, el asistente de tareas. Tienes acceso al JSON completo de las tareas del usuario. Responde de forma clara y concisa usando únicamente esa información. JSON de tareas: ' +
                JSON.stringify(tasks)
        },
        { role: 'user', content: prompt }
    ]

    // Llamada a OpenAI con GPT-4o
    const resp = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages
    })

    const aiText = resp.choices[0].message.content.trim()
    const used = resp.usage?.total_tokens ?? EST_TOKENS
    const actualCost = used * coinsPerToken

    // Descontar monedas
    user.demiCoins -= actualCost
    await user.save()

    // Respuesta
    return {
        statusCode: 200,
        body: JSON.stringify({
            reply: aiText,
            demiCoins: user.demiCoins
        })
    }
}
