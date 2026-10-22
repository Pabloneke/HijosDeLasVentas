import React from 'react';

const Blogs = () => {
    return (
        <main className="container my-5">
            <div className="text-center mb-5">
                <h2 className="fw-bold">Nuestro Blog</h2>
                <p className="text-muted lead">Consejos, novedades y guías sobre tecnología, gaming y perfumería.</p>
            </div>
            <div className="row g-4">
                <div className="col-md-4">
                    <div className="card h-100 shadow-sm border-0">
                        <div className="card-body">
                            <span className="badge bg-secondary mb-2">Tecnología</span>
                            <h5 className="card-title fw-bold">Cómo elegir el periférico ideal para tu setup</h5>
                            <p className="card-text text-muted">Descubre qué debes buscar en un teclado mecánico o un mousepad para mejorar tu rendimiento diario.</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card h-100 shadow-sm border-0">
                        <div className="card-body">
                            <span className="badge bg-secondary mb-2">Perfumería</span>
                            <h5 className="card-title fw-bold">Guía de fragancias: Notas y durabilidad</h5>
                            <p className="card-text text-muted">Aprende a diferenciar las notas de salida, corazón y fondo para elegir el perfume perfecto para ti.</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card h-100 shadow-sm border-0">
                        <div className="card-body">
                            <span className="badge bg-secondary mb-2">Gaming</span>
                            <h5 className="card-title fw-bold">Lo que esperamos de los próximos lanzamientos</h5>
                            <p className="card-text text-muted">Un repaso por los títulos más esperados del año y cómo preparativa tu hardware para correrlos al máximo.</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Blogs;