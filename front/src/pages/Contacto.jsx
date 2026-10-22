import React, { useState } from 'react';
import FormField from '../components/atoms/FormField';

const Contacto = () => {
    const [form, setForm] = useState({ nombre: '', email: '', asunto: '', mensaje: '' });
    const [enviado, setEnviado] = useState(false);
    const [errores, setErrores] = useState({});

    const handleChange = (e) => {
        setForm({ ...form, [e.target.id]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const nuevosErrores = {
            nombre: form.nombre.trim() ? '' : 'Ingresa tu nombre completo',
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? '' : 'Ingresa un correo válido',
            asunto: form.asunto.trim() ? '' : 'Ingresa un asunto',
            mensaje: form.mensaje.trim() ? '' : 'Escribe tu mensaje',
        };
        const visibles = Object.fromEntries(Object.entries(nuevosErrores).filter(([, value]) => value));
        setErrores(visibles);
        if (Object.keys(visibles).length === 0) setEnviado(true);
    };

    return (
        <main className="container my-5">
            <section className="page-intro text-center mb-5">
                <span className="home-hero-badge">Soporte de Hijos de las Ventas</span>
                <h1 className="display-5 fw-bold">¿En qué podemos ayudarte?</h1>
                <p className="text-muted lead mb-0">Resolvemos tus dudas sobre pedidos, productos, entregas y compras.</p>
            </section>
            <div className="row g-4 justify-content-center">
                <div className="col-lg-5">
                    <aside className="contact-summary">
                        <h2 className="h4 fw-bold">Canales de soporte</h2>
                        <div className="support-item">
                            <strong>Consultas sobre pedidos</strong>
                            <span>Revisa estados, entregas y coordinación de compras.</span>
                        </div>
                        <div className="support-item">
                            <strong>Ayuda con productos</strong>
                            <span>Te orientamos sobre disponibilidad, características y ofertas.</span>
                        </div>
                        <div className="support-item">
                            <strong>Atención personalizada</strong>
                            <span>Cuéntanos tu caso y te responderemos directamente.</span>
                        </div>
                    </aside>
                </div>
                <div className="col-lg-7">
                    <div className="card shadow-sm p-4 border-0">
                        {enviado && <div className="alert alert-success" role="status">Mensaje enviado de forma demostrativa. Te contactaremos a la brevedad.</div>}
                        <form onSubmit={handleSubmit} noValidate>
                            <FormField id="nombre" label="Nombre completo" value={form.nombre} onChange={handleChange} error={errores.nombre} placeholder="Ej: Paulo Catalán" />
                            <FormField id="email" label="Correo electrónico" type="email" value={form.email} onChange={handleChange} error={errores.email} placeholder="tu@correo.com" />
                            <FormField id="asunto" label="Motivo de contacto" value={form.asunto} onChange={handleChange} error={errores.asunto} placeholder="Ej: consulta sobre mi pedido" />
                            <FormField id="mensaje" label="Mensaje" as="textarea" rows="4" value={form.mensaje} onChange={handleChange} error={errores.mensaje} placeholder="Describe tu duda o problema para poder ayudarte..." />
                            <button type="submit" className="btn btn-primary w-100 fw-bold">Enviar consulta a soporte</button>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Contacto;