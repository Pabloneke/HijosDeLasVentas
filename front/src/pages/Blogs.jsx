import React from 'react';

const articulos = [
    {
        category: 'Perfumería',
        title: 'Caso curioso #1: cómo hacer que tu perfume dure más',
        description: 'Combinar bien tu perfume puede ayudar a prolongar su presencia en la piel. Conoce algunos trucos sencillos que usan los expertos.',
        image: '/img/RasasiHawas.webp',
    },
    {
        category: 'Computación',
        title: 'Caso curioso #2: más que un mousepad gamer',
        description: 'Un mousepad gamer XL también puede mejorar la precisión y comodidad del mouse durante una jornada de trabajo.',
        image: '/img/MousePadXXL.webp',
    },
];

const Blogs = () => {
    return (
        <main className="container my-5">
            <section className="page-intro text-center mb-5">
                <span className="home-hero-badge">Ideas para aprovechar mejor tus compras</span>
                <h1 className="display-5 fw-bold">Noticias importantes</h1>
                <p className="text-muted lead mb-0">Consejos, novedades y guías sobre tecnología, gaming y perfumería.</p>
            </section>
            <div className="row g-4">
                {articulos.map((articulo) => (
                    <div className="col-12" key={articulo.title}>
                        <article className="blog-card d-flex flex-column flex-md-row align-items-center gap-4">
                            <img src={articulo.image} alt="" className="blog-card-image rounded" />
                            <div>
                                <span className="badge bg-secondary mb-2">{articulo.category}</span>
                                <h2 className="h4 fw-bold">{articulo.title}</h2>
                                <p className="text-muted mb-0">{articulo.description}</p>
                            </div>
                        </article>
                    </div>
                ))}
            </div>
            <div className="blog-note text-center mt-4">
                <p className="mb-0">Seguiremos compartiendo ideas y novedades para acompañar tus próximas compras.</p>
            </div>
        </main>
    );
};

export default Blogs;