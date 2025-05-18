// src/components/TaskForm.jsx

import { useState, useEffect } from 'react';

export default function TaskForm({
    tasks = [],
    initialData = {},
    onSubmit,
    onCancel
}) {
    const [task, setTask] = useState({
        title: initialData.title ?? '',
        status: initialData.status ?? 'no comenzada',
        deadline: initialData.deadline ?? '',
        priority: initialData.priority ?? 'media',
        location: initialData.location ?? '',
        assignedBy: initialData.assignedBy ?? '',
        recommendedDate: initialData.recommendedDate ?? '',
        depends: initialData.depends ?? false,
        dependsOn: initialData.dependsOn ?? '',
        stalledReason: initialData.stalledReason ?? '',
        observation: initialData.observation ?? '',
        details: initialData.details ?? ''
    });

    const [showStalled, setShowStalled] = useState(false);
    const [showDepends, setShowDepends] = useState(false);

    useEffect(() => {
        setShowStalled(task.status === 'estancada');
        setShowDepends(task.depends);
    }, [task.status, task.depends]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setTask(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const submit = (e) => {
        e.preventDefault();
        onSubmit(task);
    };

    return (
        <form onSubmit={submit} className="flex flex-col">
            {/* 1. Tarea */}
            <div className="form-group">
                <label>Tarea*</label>
                <input
                    name="title"
                    value={task.title}
                    onChange={handleChange}
                    required
                />
            </div>

            {/* 2. Estado */}
            <div className="form-group">
                <label>Estado*</label>
                <select
                    name="status"
                    value={task.status}
                    onChange={handleChange}
                    required
                >
                    <option value="no comenzada">No comenzada</option>
                    <option value="comenzada">Comenzada</option>
                    <option value="estancada">Estancada</option>
                    <option value="finalizada">Finalizada</option>
                </select>
            </div>

            {/* 10. Motivo de estancamiento */}
            {showStalled && (
                <div className="form-group">
                    <label>Motivo de estancamiento</label>
                    <textarea
                        name="stalledReason"
                        value={task.stalledReason}
                        onChange={handleChange}
                    />
                </div>
            )}

            {/* 3. Deadline */}
            <div className="form-group">
                <label>Deadline*</label>
                <input
                    name="deadline"
                    type="datetime-local"
                    value={task.deadline}
                    onChange={handleChange}
                    required
                />
            </div>

            {/* 4. Prioridad */}
            <div className="form-group">
                <label>Prioridad</label>
                <select
                    name="priority"
                    value={task.priority}
                    onChange={handleChange}
                >
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                </select>
            </div>

            {/* 5. Lugar */}
            <div className="form-group">
                <label>Lugar</label>
                <input
                    name="location"
                    value={task.location}
                    onChange={handleChange}
                />
            </div>

            {/* 6. Quién asignó */}
            <div className="form-group">
                <label>Quién asignó</label>
                <input
                    name="assignedBy"
                    value={task.assignedBy}
                    onChange={handleChange}
                />
            </div>

            {/* 7. Fecha recomendada de completación */}
            <div className="form-group">
                <label>Fecha recomendada de completación</label>
                <input
                    name="recommendedDate"
                    type="datetime-local"
                    value={task.recommendedDate}
                    onChange={handleChange}
                />
            </div>

            {/* 8. Depende de otra tarea */}
            <div className="form-group">
                <label className="flex items-center gap-sm">
                    <span>Depende de otra tarea</span>
                    <input
                        name="depends"
                        type="checkbox"
                        checked={task.depends}
                        onChange={handleChange}
                    />
                </label>
            </div>

            {/* 9. De qué tarea depende */}
            {showDepends && (
                <div className="form-group">
                    <label>De qué tarea depende*</label>
                    <select
                        name="dependsOn"
                        value={task.dependsOn}
                        onChange={handleChange}
                        required
                    >
                        <option value="">-- Seleccione --</option>
                        {tasks.map((t) => (
                            <option key={t._id} value={t._id}>
                                {t.title}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            {/* 11. Observación */}
            <div className="form-group">
                <label>Observación</label>
                <textarea
                    name="observation"
                    value={task.observation}
                    onChange={handleChange}
                />
            </div>

            {/* 12. Detalle de la tarea */}
            <div className="form-group">
                <label>Detalle de la tarea</label>
                <textarea
                    name="details"
                    value={task.details}
                    onChange={handleChange}
                />
            </div>

            {/* Botones */}
            <div className="flex justify-end">
                <button
                    type="button"
                    className="btn btn-secondary m-sm"
                    onClick={onCancel}
                >
                    Cancelar
                </button>
                <button type="submit" className="btn btn-primary m-sm">
                    Guardar
                </button>
            </div>
        </form>
    );
}

