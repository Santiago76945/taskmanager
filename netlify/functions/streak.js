// netlify/functions/streak.js

require('dotenv').config()
const jwt = require('jsonwebtoken')
const { connectToDB } = require('./dbConnection')
const User = require('./models/User')
const Task = require('./models/Task')

exports.handler = async (event) => {
    await connectToDB()

    const auth = event.headers.authorization
    if (!auth) {
        return { statusCode: 401, body: 'No autorizado' }
    }
    let payload
    try {
        payload = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET)
    } catch {
        return { statusCode: 403, body: 'Token inválido' }
    }
    const userId = payload.userId

    try {
        if (event.httpMethod === 'GET') {
            // Devolver streak y lastUpdated
            const user = await User.findById(userId)
            return {
                statusCode: 200,
                body: JSON.stringify({
                    streak: user.streak,
                    lastUpdated: user.lastUpdated
                })
            }
        }

        if (event.httpMethod === 'POST') {
            // Calcular si hay tareas atrasadas
            const now = new Date()
            const hasOverdue = await Task.exists({
                userId,
                status: { $ne: 'finalizada' },
                deadline: { $lt: now }
            })

            // Obtener usuario y comprobar fecha
            const user = await User.findById(userId)
            const last = user.lastUpdated ? new Date(user.lastUpdated) : null
            const today = new Date().toDateString()

            if (last && last.toDateString() === today) {
                // Ya actualizado hoy
                return {
                    statusCode: 200,
                    body: JSON.stringify({
                        streak: user.streak,
                        lastUpdated: user.lastUpdated
                    })
                }
            }

            // Incrementar o reiniciar
            user.streak = hasOverdue ? 0 : user.streak + 1
            user.lastUpdated = now
            await user.save()

            return {
                statusCode: 200,
                body: JSON.stringify({
                    streak: user.streak,
                    lastUpdated: user.lastUpdated
                })
            }
        }

        return { statusCode: 405, body: 'Método no permitido' }
    } catch (error) {
        console.error('Error en streak function:', error)
        return { statusCode: 500, body: `Error interno: ${error.message}` }
    }
}
