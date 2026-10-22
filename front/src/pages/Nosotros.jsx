import React from 'react';

const Nosotros = () => {
    return (
        <main className="container my-5">
            <div className="text-center mb-5">
                <h2 className="fw-bold">Sobre Hijos de las Ventas</h2>
                <p className="text-muted lead">Conoce al equipo detrás de la tienda online más rápida y confiable.</p>
            </div>
            <div className="row align-items-center mb-5">
                <div className="col-md-6">
                    <h3 className="fw-bold text-primary">Nuestra Misión</h3>
                    <p className="text-muted">
                        Facilitar el acceso a productos de alta calidad de forma rápida, segura y con una atención al cliente de primer nivel. Nos encargamos de gestionar cada detalle para que tu experiencia de compra sea impecable de principio a fin.
                    </p>
                </div>
                <div className="col-md-6 text-center">
                    <div className="p-5 bg-light rounded shadow-sm">
                        <h4 className="fw-bold">🚀 Innovación y Confianza</h4>
                        <p className="text-muted mb-0">Un proyecto desarrollado con pasión y tecnología moderna.</p>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Nosotros;