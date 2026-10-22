import React, { useState } from 'react';

const Contacto = () => {
    // Estado del formulario: cada input es "controlado" (su valor vive en React)
    const [form, setForm] = useState({ nombre: '', email: '', asunto: '', mensaje: '' });

    // Un solo manejador para todos los campos: usa el id del input como clave
    const handleChange = (e) => {
        setForm({ ...form, [e.target.id]: e.target.value });
    };

    return (
        <main className="container my-5">
            <h2 className="text-center mb-4 fw-bold">Contáctanos</h2>
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="card shadow-sm p-4 border-0">
                        <form>
                            <div className="mb-3">
                                <label htmlFor="nombre" className="form-label fw-semibold">Nombre completo</label>
                                <input type="text" className="form-control" id="nombre" value={form.nombre} onChange={handleChange} placeholder="Ej: Paulo Catalán" required />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="email" className="form-label fw-semibold">Correo electrónico</label>
                                <input type="email" className="form-control" id="email" value={form.email} onChange={handleChange} placeholder="tu@correo.com" required />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="asunto" className="form-label fw-semibold">Asunto</label>
                                <input type="text" className="form-control" id="asunto" value={form.asunto} onChange={handleChange} placeholder="¿En qué te podemos ayudar?" required />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="mensaje" className="form-label fw-semibold">Mensaje</label>
                                <textarea className="form-control" id="mensaje" value={form.mensaje} onChange={handleChange} rows="4" placeholder="Escribe tu mensaje aquí..." required></textarea>
                            </div>
                            <button type="submit" className="btn btn-primary w-100 fw-bold">Enviar Mensaje</button>
                        </form>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Contacto;