// netlify/functions/me.js

require('dotenv').config()
const jwt = require('jsonwebtoken')
const { connectToDB } = require('./dbConnection')
const User = require('./models/User')

exports.handler = async (event) => {
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method Not Allowed' }
    }
    await connectToDB()
    const auth = event.headers.authorization
    if (!auth) return { statusCode: 401, body: 'No autorizado' }
    let payload
    try {
        payload = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET)
    } catch {
        return { statusCode: 403, body: 'Token inválido' }
    }
    const user = await User.findById(payload.userId)
    if (!user) return { statusCode: 404, body: 'Usuario no encontrado' }
    return {
        statusCode: 200,
        body: JSON.stringify({ demiCoins: user.demiCoins })
    }
}
