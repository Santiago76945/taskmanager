// netlify/functions/register.js

const bcrypt = require('bcrypt');
const { connectToDB } = require('./dbConnection');
const User = require('./models/User');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        await connectToDB();
        const { username, password, code } = JSON.parse(event.body);

        if (!username || !password || !code) {
            return {
                statusCode: 400,
                body: JSON.stringify({ msg: 'Faltan datos obligatorios' })
            };
        }

        // Verificar código de autorización (pre-establecido en .env)
        if (code !== process.env.AUTH_CODE) {
            return {
                statusCode: 401,
                body: JSON.stringify({ msg: 'Código de autorización inválido' })
            };
        }

        // Usuario duplicado
        if (await User.findOne({ username })) {
            return {
                statusCode: 409,
                body: JSON.stringify({ msg: 'El usuario ya existe' })
            };
        }

        // Generar userId incremental
        const count = await User.countDocuments();
        const userId = count + 1;

        // Hashear contraseña
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        // Crear usuario
        await new User({ userId, username, password: hash }).save();

        return {
            statusCode: 201,
            body: JSON.stringify({ msg: 'Usuario registrado correctamente' })
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ msg: 'Error interno', error: error.message })
        };
    }
};
