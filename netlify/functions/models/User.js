// netlify/functions/models/User.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: { type: Number, unique: true, required: true },
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
