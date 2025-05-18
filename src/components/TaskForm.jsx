// src/components/TaskForm.jsx

import { useState, useEffect } from 'react';

export default function TaskForm({ initialData = {}, onSubmit, onCancel }) {
    const [task, setTask] = useState({
        title: '',
        status: 'no comenzada',
        deadline: '',
        priority: 'media',
        location: '',
        assignedBy: '',
        recommendedDate: '',
        depends: false,
        dependsOn: '',
        stalledReason: '',
        observation: '',
        details: '',
        ...initialData
    });

    // Ver si mostrar campos condicionales
    const showStalled = task.status === 'estancada';
    const showDepends = task.depends;

    const handleChange = e => {
        const { name, value, type, checked } = e.target;
        setTask(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
            // Limpia campos no aplicables
            ...(name === 'status' && value !== 'estancada' ? { stalledReason: '' } : {}),
            ...(name === 'depends' && !checked ? { dependsOn: '' } : {})
        }));
    };

    const submit = e => {
        e.preventDefault();
        onSubmit(task);
    };

    return (
        <form onSubmit={submit} className="flex flex-col">
            {/* 1. Título */}
            <div className="form-group">
                <label>Tarea*</label>
                <input name="title" value={task.title} onChange={handleChange} required />
            </div>

            {/* 2. Estado */}
            <div className="form-group">
                <label>Estado*</label>
                <select name="status" value={task.status} onChange={handleChange} required>
                    <option value="no comenzada">No comenzada</option>
                    <option value="comenzada">Comenzada</option>
                    <option value="estancada">Estancada</option>
                    <option value="finalizada">Finalizada</option>
                </select>
            </div>

            {/* Motivo estancamiento */}
            {showStalled && (
                <div className="form-group">
                    <label>Motivo de estancamiento</label>
                    <textarea name="stalledReason" value={task.stalledReason} onChange={handleChange} />
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
                <select name="priority" value={task.priority} onChange={handleChange}>
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                </select>
            </div>

            {/* 5. Lugar */}
            <div className="form-group">
                <label>Lugar</label>
                <input name="location" value={task.location} onChange={handleChange} />
            </div>

            {/* 6. Quién asignó */}
            <div className="form-group">
                <label>Quién asignó</label>
                <input name="assignedBy" value={task.assignedBy} onChange={handleChange} />
            </div>

            {/* 7. Fecha recomendada */}
            <div className="form-group">
                <label>Fecha recomendada de completación</label>
                <input
                    name="recommendedDate"
                    type="datetime-local"
                    value={task.recommendedDate}
                    onChange={handleChange}
                />
            </div>

            {/* 8. Depende */}
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

            {showDepends && (
                <div className="form-group">
                    <label>De qué tarea depende*</label>
                    <input
                        name="dependsOn"
                        value={task.dependsOn}
                        onChange={handleChange}
                        required
                    />
                </div>
            )}

            {/* 11. Observación */}
            <div className="form-group">
                <label>Observación</label>
                <textarea name="observation" value={task.observation} onChange={handleChange} />
            </div>

            {/* 12. Detalle */}
            <div className="form-group">
                <label>Detalle</label>
                <textarea name="details" value={task.details} onChange={handleChange} />
            </div>

            {/* Botones */}
            <div className="flex justify-end">
                <button type="button" className="btn btn-secondary m-sm" onClick={onCancel}>
                    Cancelar
                </button>
                <button type="submit" className="btn btn-primary m-sm">
                    Guardar
                </button>
            </div>
        </form>
    );
}
