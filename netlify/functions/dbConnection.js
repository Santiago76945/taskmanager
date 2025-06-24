// netlify/functions/dbConnection.js

// Conexión única a MongoDB Atlas para Netlify Functions
require('dotenv').config();    // <— carga .env en local
const mongoose = require('mongoose');
let conn = null;

exports.connectToDB = async () => {
    if (conn) return;
    conn = await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
};