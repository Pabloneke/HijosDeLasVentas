import React from 'react';

const Nosotros = () => {
    return (
        <main className="container my-5">
            <section className="page-intro text-center mb-5">
                <span className="home-hero-badge">Conócenos</span>
                <h1 className="display-5 fw-bold">Somos <span className="text-primary">Hijos de las Ventas</span></h1>
                <p className="lead text-muted mb-0">Un emprendimiento hecho por amigos, pensado para vender rápido, bien y con confianza.</p>
            </section>

            <section className="row g-4 mb-4">
                <div className="col-lg-7">
                    <article className="info-panel h-100">
                        <h2 className="h4 text-primary fw-bold">Nuestra historia</h2>
                        <p className="mb-0">
                            <strong>"Hijos de las Ventas"</strong> nació como un proyecto entre amigos con ganas de emprender.
                            Partimos vendiendo artículos variados de almacén y, con el tiempo, sumamos productos de computación
                            y perfumería. Hoy gestionamos cada pedido de forma directa para asegurar que llegue a tiempo y en buen estado a la puerta de nuestros clientes.
                        </p>
                    </article>
                </div>
                <div className="col-lg-5">
                    <article className="info-panel info-panel-accent h-100">
                        <h2 className="h4 fw-bold">Nuestra misión</h2>
                        <p className="mb-0">
                            Ofrecer una experiencia de compra rápida, cercana y confiable, atendiendo cada pedido como si fuera para un amigo.
                        </p>
                    </article>
                </div>
            </section>

            <section className="info-panel">
                <h2 className="h4 fw-bold mb-3">El equipo</h2>
                <div className="row g-3">
                    {['Paulo Catalán', 'Mauricio Ahumada', 'Branco Aliaga', 'Alexander Arancibia'].map((integrante) => (
                        <div className="col-sm-6 col-lg-3" key={integrante}>
                            <div className="team-member">{integrante}</div>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
};

export default Nosotros;