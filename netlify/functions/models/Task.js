// netlify/functions/models/Task.js

const mongoose = require('mongoose')
const { Schema, model } = mongoose

const TaskSchema = new Schema({
    userId: { type: String, required: true },
    title: { type: String, required: true },
    status: { type: String, required: true, enum: ['no comenzada', 'comenzada', 'estancada', 'finalizada'] },
    deadline: { type: Date, required: true },
    priority: { type: String, enum: ['baja', 'media', 'alta'], default: 'media' },
    location: String,
    assignedBy: String,
    recommendedDate: Date,
    creationDate: Date,
    depends: Boolean,
    dependsOn: { type: Schema.Types.ObjectId, ref: 'Task' },
    stalledReason: String,
    completionDate: Date,
    observation: String,
    details: String,
    completedAt: Date,
    tag: String 
}, { timestamps: true })

module.exports = mongoose.models.Task || model('Task', TaskSchema)
