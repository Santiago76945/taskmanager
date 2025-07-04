// src/components/TaskForm.jsx

import { useState, useEffect } from 'react';

export default function TaskForm({
    tasks = [],
    initialData,
    onSubmit,
    onCancel
}) {
    // Función auxiliar para formatear campos de fecha/hora a "YYYY-MM-DDThh:mm"
    const formatDateTime = (value) =>
        value ? value.slice(0, 16) : '';

    // Función auxiliar que devuelve el objeto inicial según initialData,
    // aplicando formateo a los campos de fecha/hora
    const getInitTask = (data) => ({
        title: data?.title ?? '',
        status: data?.status ?? 'no comenzada',
        deadline: formatDateTime(data?.deadline),
        priority: data?.priority ?? 'media',
        location: data?.location ?? '',
        assignedBy: data?.assignedBy ?? '',
        recommendedDate: formatDateTime(data?.recommendedDate),
        creationDate: formatDateTime(data?.creationDate),
        depends: data?.depends ?? false,
        dependsOn: data?.dependsOn ?? '',
        stalledReason: data?.stalledReason ?? '',
        observation: data?.observation ?? '',
        details: data?.details ?? '',
        completionDate: formatDateTime(data?.completionDate),
        tag: data?.tag ?? '',
        customTag: data?.customTag ?? ''
    });

    // Inicializo el state usando initialData la primera vez
    const [task, setTask] = useState(getInitTask(initialData));
    const [showStalled, setShowStalled] = useState(false);
    const [showDepends, setShowDepends] = useState(false);
    const [showCompletion, setShowCompletion] = useState(false);
    const [showCustomTag, setShowCustomTag] = useState(false);

    // Cuando initialData cambie, reinicio el state del formulario con los valores existentes
    useEffect(() => {
        setTask(getInitTask(initialData));
    }, [initialData]);

    // Manejo de secciones condicionales (estancada, depende, finalizada, tag personalizado)
    useEffect(() => {
        setShowStalled(task.status === 'estancada');
        setShowDepends(task.depends);

        if (task.status === 'finalizada') {
            setShowCompletion(true);
            // Si no había fecha de completación, la prellenamos con ahora
            if (!task.completionDate) {
                setTask(t => ({
                    ...t,
                    completionDate: new Date().toISOString().slice(0, 16)
                }));
            }
        } else {
            setShowCompletion(false);
            setTask(t => ({ ...t, completionDate: '' }));
        }

        setShowCustomTag(task.tag === 'personalizado');
    }, [task.status, task.depends, task.tag]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setTask(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const submit = (e) => {
        e.preventDefault();
        const payload = { ...task };
        if (!payload.depends || !payload.dependsOn) {
            delete payload.dependsOn;
        }
        if (payload.tag !== 'personalizado') {
            delete payload.customTag;
        } else {
            payload.tag = payload.customTag;
            delete payload.customTag;
        }
        onSubmit(payload);
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

            {/* Motivo de estancamiento */}
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

            {/* Fecha de creación */}
            <div className="form-group">
                <label>Fecha de creación</label>
                <input
                    name="creationDate"
                    type="datetime-local"
                    value={task.creationDate}
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

            {/* 10. Tag */}
            <div className="form-group">
                <label>Tag</label>
                <select
                    name="tag"
                    value={task.tag}
                    onChange={handleChange}
                >
                    <option value="">-- Ninguno --</option>
                    <option value="laboral">Laboral</option>
                    <option value="personal">Personal</option>
                    <option value="personalizado">Personalizado</option>
                </select>
            </div>

            {/* Tag personalizado */}
            {showCustomTag && (
                <div className="form-group">
                    <label>Tag personalizado</label>
                    <input
                        name="customTag"
                        value={task.customTag}
                        onChange={handleChange}
                    />
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

            {/* Fecha de completación */}
            {showCompletion && (
                <div className="form-group">
                    <label>Fecha de completación</label>
                    <input
                        name="completionDate"
                        type="datetime-local"
                        value={task.completionDate}
                        onChange={handleChange}
                        required
                    />
                </div>
            )}

            {/* Botones */}
            <div className="flex justify-end">
                <button
                    type="button"
                    className="btn btn-secondary m-sm"
                    onClick={onCancel}
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="btn btn-primary m-sm"
                >
                    Guardar
                </button>
            </div>
        </form>
    );
}
