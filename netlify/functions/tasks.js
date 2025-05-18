// netlify/functions/tasks.js

const jwt = require('jsonwebtoken');
const { connectToDB } = require('./dbConnection');
const Task = require('./models/Task');

exports.handler = async (event) => {
    await connectToDB();

    // Verificar JWT
    const auth = event.headers.authorization;
    if (!auth) return { statusCode: 401, body: 'No autorizado' };
    const token = auth.split(' ')[1];
    let payload;
    try { payload = jwt.verify(token, process.env.JWT_SECRET); }
    catch { return { statusCode: 403, body: 'Token inválido' }; }
    const userId = payload.userId;

    const { httpMethod, body, queryStringParameters } = event;

    try {
        if (httpMethod === 'GET') {
            // Listar tareas del usuario, ordenadas por deadline
            const tasks = await Task.find({ userId }).sort('deadline');
            return { statusCode: 200, body: JSON.stringify(tasks) };
        }

        if (httpMethod === 'POST') {
            // Crear nueva tarea
            const data = JSON.parse(body);
            const newTask = new Task({ userId, ...data });
            if (data.status === 'finalizada') newTask.completedAt = new Date();
            await newTask.save();
            return { statusCode: 201, body: JSON.stringify(newTask) };
        }

        if (httpMethod === 'PUT') {
            // Editar tarea
            const { id, ...data } = JSON.parse(body);
            const task = await Task.findOne({ _id: id, userId });
            if (!task) return { statusCode: 404, body: 'Tarea no encontrada' };
            Object.assign(task, data);
            if (data.status === 'finalizada') task.completedAt = new Date();
            if (data.status !== 'estancada') task.stalledReason = undefined;
            await task.save();
            return { statusCode: 200, body: JSON.stringify(task) };
        }

        if (httpMethod === 'DELETE') {
            // Eliminar tarea
            const { id } = queryStringParameters || {};
            await Task.findOneAndDelete({ _id: id, userId });
            return { statusCode: 204, body: '' };
        }

        return { statusCode: 405, body: 'Método no permitido' };

    } catch (error) {
        return { statusCode: 500, body: `Error interno: ${error.message}` };
    }
};
