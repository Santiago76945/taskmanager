// netlify/functions/register.js

require('dotenv').config()
const bcrypt = require('bcrypt')       // o bcryptjs
const { connectToDB } = require('./dbConnection')
const User = require('./models/User')

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' }
    }

    try {
        await connectToDB()
        const { username, password, code } = JSON.parse(event.body)

        if (!username || !password || !code) {
            return {
                statusCode: 400,
                body: JSON.stringify({ msg: 'Faltan datos obligatorios' })
            }
        }

        if (code !== process.env.AUTH_CODE) {
            return {
                statusCode: 401,
                body: JSON.stringify({ msg: 'Código de autorización inválido' })
            }
        }

        if (await User.findOne({ username })) {
            return {
                statusCode: 409,
                body: JSON.stringify({ msg: 'El usuario ya existe' })
            }
        }

        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)

        // ← Aquí el cambio clave:
        await new User({ username, passwordHash: hash, code }).save()

        return {
            statusCode: 201,
            body: JSON.stringify({ msg: 'Usuario registrado correctamente' })
        }

    } catch (error) {
        console.error('❌ Error en register:', error)
        return {
            statusCode: 500,
            body: JSON.stringify({ msg: 'Error interno', error: error.message })
        }
    }
}
