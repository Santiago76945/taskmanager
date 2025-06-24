// netlify/functions/models/User.js

const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const UserSchema = new Schema({
    userId: { type: String },                        // nuevo campo para Google UID
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String },                  // ya no es required
    code: String,
    streak: { type: Number, default: 0 },
    lastUpdated: Date,
    demiCoins: { type: Number, default: 0 }          // saldo de Demi Coins para consultas AI
}, { timestamps: true });

// Índice único sobre userId, pero solo para documentos donde userId es distinto de null
UserSchema.index(
    { userId: 1 },
    {
        unique: true,
        partialFilterExpression: { userId: { $exists: true, $ne: null } }
    }
);

module.exports = mongoose.models.User || model('User', UserSchema);
