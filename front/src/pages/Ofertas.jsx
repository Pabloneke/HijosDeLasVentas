import React, { useEffect, useState } from 'react';
import ProductCard from '../components/molecules/ProductCard';
import { useCart } from '../context/CartContext';
import { getProducts } from '../services/db';

// Descuentos promocionales de demostración asociados a productos reales del catálogo.
// El precio persistido en la base de productos no se modifica.
const DESCUENTOS = {
    1: 20,
    3: 15,
    5: 25,
    6: 10,
};

const crearOfertas = (productos) => productos
    .filter((producto) => DESCUENTOS[producto.id])
    .map((producto) => {
        const discountPercent = DESCUENTOS[producto.id];
        const price = Math.round(producto.price * (1 - discountPercent / 100));
        return { ...producto, originalPrice: producto.price, price, discountPercent };
    });

const Ofertas = () => {
    const [ofertas, setOfertas] = useState([]);
    const { addItem } = useCart();

    useEffect(() => {
        setOfertas(crearOfertas(getProducts()));
    }, []);

    return (
        <main className="container my-5">
            <section className="offers-hero text-center rounded-4 p-4 p-md-5 mb-5">
                <span className="badge bg-warning text-dark px-3 py-2 mb-3">Promociones por tiempo limitado</span>
                <h1 className="display-5 fw-bold mb-3">Ofertas especiales</h1>
                <p className="lead mb-0 mx-auto">
                    Encuentra precios increíbles en productos seleccionados y disfruta tus favoritos por menos.
                </p>
            </section>

            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
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

export { crearOfertas };
export default Ofertas;
