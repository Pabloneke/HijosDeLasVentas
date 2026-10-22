import { useEffect, useState } from 'react';
import ProductCard from '../components/molecules/ProductCard';
import { getOffers } from '../services/db';
import { useCart } from '../context/CartContext';

const Ofertas = () => {
    const [offers, setOffers] = useState([]);
    const { addToCart } = useCart();

    useEffect(() => {
        setOffers(getOffers());
    }, []);

    return (
        <main className="container my-5">
            <section className="offers-hero text-center mb-5">
                <span className="badge bg-warning text-dark px-3 py-2 mb-3">Descuentos por tiempo limitado</span>
                <h1 className="display-5 fw-bold mb-3">Ofertas especiales</h1>
                <p className="lead text-muted mx-auto mb-0">
                    Encuentra tus productos favoritos con precios especiales y aprovecha antes de que se terminen.
                </p>
            </section>

            {offers.length > 0 ? (
                <section className="row g-4 justify-content-center" aria-label="Productos en oferta">
                    {offers.map((product) => (
                        <div className="col-sm-6 col-lg-4" key={product.id}>
                            <ProductCard
                                {...product}
                                onAddToCart={addToCart}
                            />
                        </div>
                    ))}
                </section>
            ) : (
                <section className="offers-empty text-center py-5">
                    <h2 className="h4">No hay ofertas disponibles por ahora</h2>
                    <p className="text-muted mb-0">Vuelve pronto para descubrir nuevos descuentos.</p>
                </section>
            )}
        </main>
    );
};

export default Ofertas;
