import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormField from '../components/atoms/FormField';
import { useAuth } from '../context/AuthContext';
import { createUser } from '../services/db';
import { validarRegistro } from '../utils/validaciones';
import { REGIONES } from '../utils/regiones';

const formVacio = {
    run: '', nombre: '', apellidos: '', correo: '', password: '', confirmar: '',
    region: '', comuna: '', direccion: '',
};

const Registro = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState(formVacio);
    const [errores, setErrores] = useState({});

    // Un solo manejador para todos los campos: usa el id del control como clave
    const handleChange = (e) => {
        setForm({ ...form, [e.target.id]: e.target.value });
    };

    // RF4: al cambiar la región se limpia la comuna, porque cada región tiene sus propias comunas
    const handleRegionChange = (e) => {
        setForm({ ...form, region: e.target.value, comuna: '' });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const erroresForm = validarRegistro(form);
        setErrores(erroresForm);
        if (Object.keys(erroresForm).length > 0) return;

        try {
            createUser({
                run: form.run.trim().toUpperCase(),
                nombre: form.nombre.trim(),
                apellidos: form.apellidos.trim(),
                correo: form.correo.trim(),
                password: form.password,
                tipo: 'cliente',
                direccion: form.direccion.trim(),
                region: form.region,
                comuna: form.comuna,
            });
        } catch (error) {
            // Único error posible: el correo ya existe
            setErrores({ correo: error.message });
            return;
        }

        // Tras registrarse el usuario queda con la sesión iniciada
        login(form.correo, form.password);
        navigate('/');
    };

    const comunas = REGIONES[form.region] || [];

    return (
        <main className="container my-5">
            <h2 className="text-center mb-4 fw-bold">Crear cuenta</h2>
            <div className="row justify-content-center">
                <div className="col-md-10 col-lg-7">
                    <div className="card shadow-sm p-4 border-0">
                        <form onSubmit={handleSubmit} noValidate>
                            <div className="row">
                                <div className="col-md-6">
                                    <FormField id="run" label="RUN (sin puntos ni guion)" placeholder="Ej: 123456785" maxLength={9}
                                        value={form.run} onChange={handleChange} error={errores.run} />
                                </div>
                                <div className="col-md-6">
                                    <FormField id="correo" label="Correo electrónico" type="email" placeholder="tu@duoc.cl" maxLength={100}
                                        value={form.correo} onChange={handleChange} error={errores.correo} />
                                </div>
                                <div className="col-md-6">
                                    <FormField id="nombre" label="Nombre" maxLength={50}
                                        value={form.nombre} onChange={handleChange} error={errores.nombre} />
                                </div>
                                <div className="col-md-6">
                                    <FormField id="apellidos" label="Apellidos" maxLength={100}
                                        value={form.apellidos} onChange={handleChange} error={errores.apellidos} />
                                </div>
                                <div className="col-md-6">
                                    <FormField id="password" label="Contraseña" type="password" maxLength={10}
                                        value={form.password} onChange={handleChange} error={errores.password} />
                                </div>
                                <div className="col-md-6">
                                    <FormField id="confirmar" label="Confirmar contraseña" type="password" maxLength={10}
                                        value={form.confirmar} onChange={handleChange} error={errores.confirmar} />
                                </div>
                                <div className="col-md-6">
                                    <FormField id="region" label="Región" as="select"
                                        value={form.region} onChange={handleRegionChange} error={errores.region}>
                                        <option value="">-- Seleccione la región --</option>
                                        {Object.keys(REGIONES).map((region) => (
                                            <option key={region} value={region}>{region}</option>
                                        ))}
                                    </FormField>
                                </div>
                                <div className="col-md-6">
                                    <FormField id="comuna" label="Comuna" as="select" disabled={comunas.length === 0}
                                        value={form.comuna} onChange={handleChange} error={errores.comuna}>
                                        <option value="">-- Seleccione la comuna --</option>
                                        {comunas.map((comuna) => (
                                            <option key={comuna} value={comuna}>{comuna}</option>
                                        ))}
                                    </FormField>
                                </div>
                            </div>
                            <FormField id="direccion" label="Dirección" maxLength={300}
                                value={form.direccion} onChange={handleChange} error={errores.direccion} />

                            <button type="submit" className="btn btn-primary w-100 fw-bold">Registrarme</button>
                        </form>
                        <p className="text-center text-muted mt-3 mb-0">
                            ¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Registro;
