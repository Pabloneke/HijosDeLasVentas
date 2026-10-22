import React, { useEffect, useState } from 'react';
import ProductCard from '../components/molecules/ProductCard';
import { useCart } from '../context/CartContext';
import { getProducts } from '../services/db';
import { crearOfertas } from '../utils/ofertas';

const Ofertas = () => {
    const [ofertas, setOfertas] = useState([]);
    const { addItem } = useCart();

    useEffect(() => {
        setOfertas(crearOfertas(getProducts()));
    }, []);

    return (
        <main className="container my-5">
            <section className="page-intro text-center mb-5">
                <span className="home-hero-badge">Promociones por tiempo limitado</span>
                <h1 className="display-5 fw-bold">Ofertas especiales</h1>
                <p className="text-muted lead mb-0">
                    Encuentra precios increíbles en productos seleccionados y disfruta tus favoritos por menos.
                </p>
            </section>

            <div className="section-heading d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                <div>
                    <h2 className="h3 mb-1">Descuentos destacados</h2>
                    <p className="text-muted mb-0">Aprovecha estas oportunidades antes de que se agoten.</p>
                </div>
                <span className="badge bg-primary rounded-pill px-3 py-2">{ofertas.length} ofertas activas</span>
            </div>

            {ofertas.length > 0 ? (
                <section className="row g-4 justify-content-center" aria-label="Productos en oferta">
                    {ofertas.map((oferta) => (
                        <div className="col-sm-6 col-lg-3" key={oferta.id}>
                            <ProductCard
                                {...oferta}
                                buttonLabel="Agregar al carrito"
                                onAddToCart={(product, sourceElement) => addItem(product, sourceElement)}
                            />
                        </div>
                    ))}
                </section>
            ) : (
                <section className="text-center text-muted py-5">
                    <p className="lead mb-0">No hay ofertas disponibles en este momento.</p>
                </section>
            )}
        </main>
    );
};

export default Ofertas;
