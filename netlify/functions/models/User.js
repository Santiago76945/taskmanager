// netlify/functions/models/User.js

const mongoose = require('mongoose')
const { Schema, model } = mongoose

const UserSchema = new Schema({
    username: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    // código interno para registro
    code: String,

    // → Nuevos campos para streak
    streak: { type: Number, default: 0 },
    lastUpdated: Date
}, { timestamps: true })

module.exports = mongoose.models.User || model('User', UserSchema)

