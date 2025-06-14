// src/components/LoginForm.jsx

import { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export default function LoginForm() {
    const { login, loginWithGoogle, register } = useContext(AuthContext);
    const [mode, setMode] = useState('login');        // 'login' | 'register'
    const [form, setForm] = useState({ username: '', password: '', code: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            if (mode === 'login') {
                await login(form.username, form.password);
            } else {
                await register(form.username, form.password, form.code);
                setSuccess('Usuario registrado correctamente. Por favor inicia sesión.');
                setMode('login');
            }
        } catch (err) {
            setError(err.response?.data?.msg || 'Error del servidor');
        }
    };

    const handleGoogle = async () => {
        setError('');
        try {
            await loginWithGoogle();
        } catch (err) {
            setError('No se pudo iniciar sesión con Google');
        }
    };

    return (
        <div className="flex flex-center" style={{ minHeight: '100vh' }}>
            <div className="card card-primary" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 className="text-center m-md">
                    {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
                </h2>

                {success && (
                    <p className="text-center m-sm" style={{ color: 'var(--color-success)' }}>
                        {success}
                    </p>
                )}

                {error && (
                    <p className="text-center m-sm" style={{ color: 'var(--color-danger)' }}>
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Usuario</label>
                        <input
                            className="p-sm"
                            name="username"
                            placeholder="Usuario"
                            value={form.username}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Contraseña</label>
                        <input
                            className="p-sm"
                            name="password"
                            type="password"
                            placeholder="Contraseña"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {mode === 'register' && (
                        <div className="form-group">
                            <label>Código de autorización</label>
                            <input
                                className="p-sm"
                                name="code"
                                placeholder="Código de autorización"
                                value={form.code}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        className={`btn ${mode === 'login' ? 'btn-primary' : 'btn-secondary'} m-sm`}
                    >
                        {mode === 'login' ? 'Entrar' : 'Registrarse'}
                    </button>
                </form>

                <button
                    onClick={handleGoogle}
                    className="btn btn-google m-sm"
                    style={{ width: '100%' }}
                >
                    Continuar con Google
                </button>

                <p
                    className="text-center text-primary m-md"
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                        setError('');
                        setSuccess('');
                        setMode(mode === 'login' ? 'register' : 'login');
                    }}
                >
                    {mode === 'login'
                        ? '¿No tienes cuenta? Regístrate'
                        : '¿Ya tienes cuenta? Inicia sesión'}
                </p>
            </div>
        </div>
    );
}
