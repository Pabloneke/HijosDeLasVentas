import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormField from '../components/atoms/FormField';
import { useAuth } from '../context/AuthContext';
import { validarLogin } from '../utils/validaciones';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    // Estado del formulario, errores por campo y error general (credenciales incorrectas)
    const [form, setForm] = useState({ correo: '', password: '' });
    const [errores, setErrores] = useState({});
    const [errorGeneral, setErrorGeneral] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.id]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrorGeneral('');

        const erroresForm = validarLogin(form);
        setErrores(erroresForm);
        if (Object.keys(erroresForm).length > 0) return;

        try {
            const sesion = login(form.correo, form.password);
            // El personal va al panel de administración; el cliente, al inicio
            navigate(sesion.tipo === 'cliente' ? '/' : '/admin');
        } catch (error) {
            setErrorGeneral(error.message);
        }
    };

    return (
        <main className="container auth-page my-5">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-5">
                    <div className="auth-card">
                        <div className="auth-brand text-center">
                            <img src="/img/logo.png" alt="Logo Hijos de las Ventas" />
                            <h1>Hijos de las Ventas</h1>
                            <h2>Inicio de sesión</h2>
                        </div>
                        {/* noValidate: las validaciones las hace React, con mensajes propios */}
                        <form onSubmit={handleSubmit} noValidate>
                            {errorGeneral && <div className="alert alert-danger" role="alert">{errorGeneral}</div>}

                            <FormField id="correo" label="Correo electrónico" type="email" placeholder="tu@duoc.cl"
                                value={form.correo} onChange={handleChange} error={errores.correo} />
                            <FormField id="password" label="Contraseña" type="password" maxLength={10}
                                value={form.password} onChange={handleChange} error={errores.password} />

                            <button type="submit" className="btn btn-primary w-100 fw-bold">Ingresar</button>
                        </form>
                        <p className="text-center text-muted mt-3 mb-0">
                            ¿No tienes cuenta? <Link to="/registro">Crear cuenta</Link>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Login;
