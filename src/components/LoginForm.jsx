// src/components/LoginForm.jsx

import React, { useState, useContext } from 'react';
import logoAndText from '../assets/logo-and-text.png';
import GoogleIcon from '../assets/google-icon.svg';
import { AuthContext } from '../contexts/AuthContext';

export default function LoginForm() {
    const { login, loginWithGoogle, register } = useContext(AuthContext);
    const [mode, setMode] = useState('login');            // 'login' | 'register'
    const [form, setForm] = useState({ username: '', password: '', code: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = e =>
        setForm({ ...form, [e.target.name]: e.target.value });

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
        } catch {
            setError('No se pudo iniciar sesión con Google');
        }
    };

    return (
        <div className="login-container">
            {/* ---------- CARD PRINCIPAL ---------- */}
            <div className="login-card">

                {/* Logo y lema / título */}
                <div className="login-logo">
                    <img src={logoAndText} alt="Demi logo" />
                </div>

                {mode === 'login' ? (
                    <p className="login-motto">The habit of getting things done!</p>
                ) : (
                    <h2 className="login-heading">Crear cuenta</h2>
                )}

                {/* Mensajes de estado */}
                {success && <p className="login-message login-success">{success}</p>}
                {error && <p className="login-message login-error">{error}</p>}

                {/* ---------- FORMULARIO ---------- */}
                <form onSubmit={handleSubmit}>
                    <div className="login-form-group">
                        <label className="login-label">Usuario</label>
                        <input
                            className="login-input"
                            name="username"
                            placeholder="Usuario"
                            value={form.username}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="login-form-group">
                        <label className="login-label">Contraseña</label>
                        <input
                            className="login-input"
                            name="password"
                            type="password"
                            placeholder="Contraseña"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {mode === 'register' && (
                        <div className="login-form-group">
                            <label className="login-label">Código de autorización</label>
                            <input
                                className="login-input"
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
                        className={`login-btn ${mode === 'login' ? 'login-btn-primary' : 'login-btn-secondary'
                            }`}
                    >
                        {mode === 'login' ? 'Entrar' : 'Registrarse'}
                    </button>
                </form>

                {/* ---------- GOOGLE ---------- */}
                <button onClick={handleGoogle} className="login-btn login-btn-google">
                    <img src={GoogleIcon} alt="Google logo" />
                    Continuar con Google
                </button>

                {/* ---------- CAMBIO DE MODO ---------- */}
                <p
                    className="login-toggle-mode"
                    onClick={() => {
                        setError('');
                        setSuccess('');
                        setMode(mode === 'login' ? 'register' : 'login');
                    }}
                >
                    {mode === 'login'
                        ? 'Crear una cuenta con código de autorización'
                        : '¿Ya tienes cuenta? Inicia sesión'}
                </p>
            </div>

            {/* ---------- FOOTER ---------- */}
            <footer className="login-footer">
                <a href="/terms" target="_blank" rel="noopener noreferrer">
                    Terms of Use
                </a>
                |
                <a href="/privacy" target="_blank" rel="noopener noreferrer">
                    Privacy Policy
                </a>
                <br />
                TK Apps® 2025
            </footer>
        </div>
    );
}
