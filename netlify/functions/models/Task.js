// netlify/functions/models/Task.js

const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    userId: { type: Number, required: true },
    title: { type: String, required: true },
    location: { type: String },
    status: {
        type: String,
        enum: ['no comenzada', 'comenzada', 'estancada', 'finalizada'],
        required: true
    },
    completedAt: { type: Date },
    stalledReason: { type: String },
    assignedBy: { type: String },
    deadline: { type: Date, required: true },
    recommendedDate: { type: Date },
    depends: { type: Boolean, default: false },
    dependsOn: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    observation: { type: String },
    details: { type: String },
    priority: { type: String, enum: ['baja', 'media', 'alta'] },
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.models.Task || mongoose.model('Task', taskSchema);
