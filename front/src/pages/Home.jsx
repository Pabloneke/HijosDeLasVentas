import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    const frase = "🔥 HIJOS DE LAS VENTAS 💸 - ";
    const fraseMultiplicada = frase.repeat(15);

    return (
        <main>
            <div className="promo-ticker bg-warning text-dark overflow-hidden py-2 font-monospace fw-bold" aria-label="Promoción de Hijos de las Ventas">
                <div className="promo-ticker-track">
                    <span className="promo-ticker-text">{fraseMultiplicada}</span>
                    <span className="promo-ticker-text" aria-hidden="true">{fraseMultiplicada}</span>
                </div>
            </div>

            <div className="container my-5 text-center">
                <section className="mb-5">
                    <span className="badge bg-primary mb-2 px-3 py-2">Tu tienda online</span>
                    <h2 className="display-4 fw-bold">Bienvenido a tu <span className="text-primary">tienda rápida</span> y confiable</h2>
                    <p className="lead text-muted mx-auto" style={{ maxWidth: '600px' }}>
                        Todo lo que buscas, gestionado directamente para ti con rapidez, confianza y atención personalizada.
                    </p>
                    
                    <div className="mt-4 gap-3 d-flex justify-content-center">
                        <Link to="/contacto" className="btn btn-warning btn-lg fw-bold">Hacer un pedido ahora</Link>
                        <Link to="/productos" className="btn btn-outline-primary btn-lg fw-bold">Ver productos</Link>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default Home;