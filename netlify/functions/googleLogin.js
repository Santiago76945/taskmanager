// netlify/functions/googleLogin.js

require('dotenv').config();
const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const { connectToDB } = require('./dbConnection');
const User = require('./models/User');

// Inicializar Firebase Admin si aún no está
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
    });
}

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { idToken } = JSON.parse(event.body);
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { uid, email } = decodedToken;

        if (!uid) {
            return {
                statusCode: 400,
                body: JSON.stringify({ msg: 'UID inválido en token' })
            };
        }

        await connectToDB();

        // 1) Intento encontrar por userId
        let user = await User.findOne({ userId: uid });

        // 2) Si no existe, busco por email (username) y asigno uid
        if (!user) {
            user = await User.findOne({ username: email });
            if (user) {
                user.userId = uid;
                await user.save();
            }
        }

        // 3) Si aún no existe, lo creo nuevo
        if (!user) {
            user = new User({
                userId: uid,           // <-- usar 'uid', no 'userId' indefinido
                username: email,
                passwordHash: '',
                code: ''
            });
            await user.save();
        }

        // 4) Genero y devuelvo mi JWT
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET
        );

        return {
            statusCode: 200,
            body: JSON.stringify({ token })
        };

    } catch (err) {
        console.error('❌ Error en googleLogin:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({ msg: 'Error interno', error: err.message })
        };
    }
};
