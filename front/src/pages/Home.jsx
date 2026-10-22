import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    const frase = "🔥 HIJOS DE LAS VENTAS 💸 - ";
    const fraseMultiplicada = frase.repeat(15);

    return (
        <main>
            <div className="home-promo-ticker" aria-label="Promoción de Hijos de las Ventas">
                <div className="home-promo-track">
                    <span>{fraseMultiplicada}</span>
                    <span aria-hidden="true">{fraseMultiplicada}</span>
                </div>
            </div>

            <div className="container my-5">
                <section className="home-hero text-center mb-5">
                    <div className="home-hero-content">
                        <span className="home-hero-badge">Tu tienda online</span>
                        <h1 className="home-hero-title">Bienvenido a tu <span>tienda rápida</span> y confiable</h1>
                        <p className="home-hero-subtitle">
                        Todo lo que buscas, gestionado directamente para ti con rapidez, confianza y atención personalizada.
                        </p>

                        <div className="home-hero-actions">
                            <Link to="/contacto" className="btn btn-warning btn-lg fw-bold">Hacer un pedido ahora</Link>
                            <Link to="/productos" className="btn btn-outline-primary btn-lg fw-bold">Ver productos</Link>
                        </div>

                        <div className="home-hero-stats" aria-label="Indicadores del emprendimiento">
                            <div>
                                <strong>+500</strong>
                                <span>pedidos</span>
                            </div>
                            <div>
                                <strong>24h</strong>
                                <span>respuesta</span>
                            </div>
                            <div>
                                <strong>100%</strong>
                                <span>confianza</span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="home-about mb-5">
                    <p className="mb-0">
                        <strong>"Hijos de las Ventas"</strong> es un emprendimiento hecho por amigos.
                        Nos dedicamos a la venta rápida de productos en línea, ofreciendo desde artículos
                        variados de almacén hasta especialidades de computación y perfumería. Actualmente
                        gestionamos tus pedidos de forma directa para asegurar entregas oportunas en tu puerta.
                    </p>
                </section>

                <section className="home-video mb-5">
                    <h2 className="text-center mb-4">Conoce más sobre nosotros</h2>
                    <div className="ratio ratio-16x9 shadow-sm rounded overflow-hidden">
                        <iframe
                            src="https://www.youtube.com/embed/zj4CNZsCKC4?start=216"
                            title="Video de Hijos de las Ventas"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                        />
                    </div>
                </section>
            </div>
        </main>
    );
};

export default Home;