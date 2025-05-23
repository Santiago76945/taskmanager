// netlify/functions/login.js

require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { connectToDB } = require('./dbConnection');
const User = require('./models/User');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        await connectToDB();
        const { username, password } = JSON.parse(event.body);

        if (!username || !password) {
            return {
                statusCode: 400,
                body: JSON.stringify({ msg: 'Faltan datos obligatorios' })
            };
        }

        const user = await User.findOne({ username });
        if (!user) {
            return {
                statusCode: 404,
                body: JSON.stringify({ msg: 'Usuario no encontrado' })
            };
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return {
                statusCode: 401,
                body: JSON.stringify({ msg: 'Credenciales inválidas' })
            };
        }

        // Firmar JWT con userId e _id
        const token = jwt.sign(
            { userId: user.userId, id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        return {
            statusCode: 200,
            body: JSON.stringify({ token })
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ msg: 'Error interno', error: error.message })
        };
    }
};
