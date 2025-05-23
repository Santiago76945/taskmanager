// netlify/functions/tasks.js

require('dotenv').config();
const jwt = require('jsonwebtoken')
const { connectToDB } = require('./dbConnection')
const Task = require('./models/Task')

exports.handler = async (event) => {
    await connectToDB()

    // Verificar JWT
    const auth = event.headers.authorization
    if (!auth) return { statusCode: 401, body: 'No autorizado' }
    const token = auth.split(' ')[1]
    let payload
    try {
        payload = jwt.verify(token, process.env.JWT_SECRET)
    } catch {
        return { statusCode: 403, body: 'Token inválido' }
    }
    const userId = payload.userId

    const { httpMethod, body, queryStringParameters } = event

    try {
        if (httpMethod === 'GET') {
            // Listar tareas del usuario, ordenadas por deadline
            const tasks = await Task.find({ userId }).sort('deadline')
            return { statusCode: 200, body: JSON.stringify(tasks) }
        }

        if (httpMethod === 'POST') {
            // Crear nueva tarea
            const data = JSON.parse(body)

            // Construir objeto a salvar, incluyendo creación opcional
            const newTaskData = {
                userId,
                title: data.title,
                status: data.status,
                deadline: new Date(data.deadline),
                priority: data.priority || 'media',
                location: data.location,
                assignedBy: data.assignedBy,
                recommendedDate: data.recommendedDate ? new Date(data.recommendedDate) : undefined,
                creationDate: data.creationDate ? new Date(data.creationDate) : undefined,
                depends: data.depends || false,
                dependsOn: data.depends && data.dependsOn ? data.dependsOn : undefined,
                stalledReason: data.stalledReason,
                observation: data.observation,
                details: data.details
            }

            // Si está completada, asignar timestamps
            if (data.status === 'finalizada') {
                newTaskData.completedAt = new Date()
                newTaskData.completionDate = data.completionDate
                    ? new Date(data.completionDate)
                    : new Date()
            }

            const newTask = new Task(newTaskData)
            await newTask.save()
            return { statusCode: 201, body: JSON.stringify(newTask) }
        }

        if (httpMethod === 'PUT') {
            // Editar tarea
            const { id, ...data } = JSON.parse(body)
            const task = await Task.findOne({ _id: id, userId })
            if (!task) return { statusCode: 404, body: 'Tarea no encontrada' }

            // Asignar campos presentes
            Object.keys(data).forEach((key) => {
                const val = data[key]
                if (val !== undefined && val !== '') {
                    if (['deadline', 'recommendedDate', 'creationDate', 'completionDate'].includes(key)) {
                        task[key] = new Date(val)
                    } else {
                        task[key] = val
                    }
                }
            })

            // Lógica para completionDate
            if (data.status === 'finalizada') {
                task.completedAt = new Date()
                task.completionDate = data.completionDate
                    ? new Date(data.completionDate)
                    : new Date()
            } else {
                task.stalledReason = undefined
                task.completionDate = undefined
            }

            await task.save()
            return { statusCode: 200, body: JSON.stringify(task) }
        }

        if (httpMethod === 'DELETE') {
            // Eliminar tarea
            const { id } = queryStringParameters || {}
            await Task.findOneAndDelete({ _id: id, userId })
            return { statusCode: 204, body: '' }
        }

        return { statusCode: 405, body: 'Método no permitido' }
    } catch (error) {
        console.error('Tasks function error:', error)
        return { statusCode: 500, body: `Error interno: ${error.message}` }
    }
}
