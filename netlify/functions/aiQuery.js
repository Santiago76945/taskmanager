// netlify/functions/aiQuery.js

require('dotenv').config()
const jwt = require('jsonwebtoken')
const { connectToDB } = require('./dbConnection')
const User = require('./models/User')
const Task = require('./models/Task')
const { OpenAI } = require('openai')
// Para contar tokens según el modelo
const { encoding_for_model } = require('@dqbd/tiktoken')

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
    } catch (err) {
        console.error('Token inválido:', err)
        return { statusCode: 403, body: 'Token inválido' }
    }
    const userId = payload.userId

    // Carga usuario y tasa
    const user = await User.findById(userId)
    if (!user) return { statusCode: 404, body: 'Usuario no encontrado' }
    const coinsPerToken = parseFloat(process.env.COINS_PER_TOKEN) || 0

    // Leer y validar prompt de usuario
    let prompt
    try {
        const body = JSON.parse(event.body)
        prompt = body.prompt
        if (typeof prompt !== 'string') throw new Error('Prompt inválido')
    } catch (err) {
        console.error('Prompt inválido:', err)
        return { statusCode: 400, body: 'Body JSON inválido o prompt faltante' }
    }

    // Cargar tareas
    let tasks
    try {
        tasks = await Task.find({ userId }).sort('deadline').lean()
    } catch (err) {
        console.error('Error cargando tareas:', err)
        return { statusCode: 500, body: 'Error cargando tareas del usuario' }
    }

    // Construir mensajes
    const messages = [
        {
            role: 'system',
            content:
                'Eres Demetria, el asistente de tareas. Tienes acceso al JSON de tus tareas. ' +
                'Responde usando únicamente esa información. JSON: ' +
                JSON.stringify(tasks)
        },
        { role: 'user', content: prompt }
    ]

    // Si es preview, contar tokens reales y devolver estimado
    const isPreview = event.queryStringParameters?.preview === 'true'
    if (isPreview) {
        // Abrir el encoding para gpt-4o
        const encoding = encoding_for_model('gpt-4o')
        let totalTokens = 0
        for (const msg of messages) {
            totalTokens += encoding.encode(msg.content).length
        }
        encoding.free()

        const estimatedCost = totalTokens * coinsPerToken
        return {
            statusCode: 200,
            body: JSON.stringify({
                usedTokens: totalTokens,
                coinsPerToken,
                actualCost: estimatedCost
            })
        }
    }

    // Verificar saldo mínimo para proceder
    if (user.demiCoins < coinsPerToken) {
        return {
            statusCode: 402,
            body: JSON.stringify({ msg: 'Saldo insuficiente', demiCoins: user.demiCoins })
        }
    }

    // Llamada real a OpenAI
    let resp
    try {
        resp = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages
        })
    } catch (err) {
        console.error('Error llamando a OpenAI:', err)
        return {
            statusCode: 500,
            body: JSON.stringify({ msg: 'Error generando respuesta de IA', error: err.message })
        }
    }

    // Tokens reales usados y coste
    const usedTokens = resp.usage.total_tokens
    const actualCost = usedTokens * coinsPerToken

    if (actualCost > user.demiCoins) {
        return {
            statusCode: 402,
            body: JSON.stringify({ msg: 'Saldo insuficiente para esta consulta', demiCoins: user.demiCoins })
        }
    }

    // Descontar y guardar
    user.demiCoins -= actualCost
    await user.save()

    // Responder al cliente
    return {
        statusCode: 200,
        body: JSON.stringify({
            reply: resp.choices[0].message.content.trim(),
            demiCoins: user.demiCoins,
            usedTokens,
            coinsPerToken,
            actualCost
        })
    }
}
