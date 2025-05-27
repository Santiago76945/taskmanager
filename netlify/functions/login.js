// netlify/functions/login.js

require('dotenv').config()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')   // o bcryptjs si lo prefieres
const { connectToDB } = require('./dbConnection')
const User = require('./models/User')

exports.handler = async (event) => {
    console.log('🔔 /login invoked, method:', event.httpMethod)

    if (event.httpMethod !== 'POST') {
        console.log('⛔ Método no permitido:', event.httpMethod)
        return { statusCode: 405, body: 'Method Not Allowed' }
    }

    try {
        console.log('1) Conectando a la base de datos...')
        await connectToDB()
        console.log('✅ Conexión exitosa')

        console.log('2) Parseando body...')
        const body = JSON.parse(event.body)
        console.log('📦 Body recibido:', body)

        const { username, password } = body
        if (!username || !password) {
            console.log('⚠️ Username o password faltante')
            return {
                statusCode: 400,
                body: JSON.stringify({ msg: 'Faltan usuario o contraseña' })
            }
        }

        console.log(`3) Buscando usuario "${username}" en la BD...`)
        const user = await User.findOne({ username })
        if (!user) {
            console.log('❌ Usuario no encontrado')
            return {
                statusCode: 401,
                body: JSON.stringify({ msg: 'Credenciales inválidas' })
            }
        }
        console.log('✅ Usuario encontrado:', {
            _id: user._id,
            username: user.username,
            // NO imprimas user.passwordHash en producción, es sólo debug
            passwordHash: user.passwordHash,
            code: user.code,
            createdAt: user.createdAt
        })

        console.log('4) Comparando password con hash...')
        console.log('   password (clear):', password)
        console.log('   passwordHash:', user.passwordHash)
        const valid = await bcrypt.compare(password, user.passwordHash)

        if (!valid) {
            console.log('❌ Contraseña inválida')
            return {
                statusCode: 401,
                body: JSON.stringify({ msg: 'Credenciales inválidas' })
            }
        }
        console.log('✅ Contraseña válida')

        console.log('5) Generando JWT...')
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET
        )
        console.log('🔑 Token generado:', token)

        console.log('6) Respondiendo con token')
        return {
            statusCode: 200,
            body: JSON.stringify({ token })
        }

    } catch (err) {
        console.error('❌ Error en función login:', err)
        return {
            statusCode: 500,
            body: JSON.stringify({ msg: 'Error interno', error: err.message })
        }
    }
}
