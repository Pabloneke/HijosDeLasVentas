import React, { useState, useEffect } from 'react';
import ProductCard from '../components/molecules/ProductCard';
import { getProducts } from '../services/db';
import { useCart } from '../context/CartContext';
import { aplicarOferta } from '../utils/ofertas';

const Productos = () => {
    // Estado para guardar los productos que vienen de la "base de datos"
    const [productos, setProductos] = useState([]);
    const { addItem } = useCart();

    // useEffect se ejecuta una vez cuando la página carga
    useEffect(() => {
        const data = getProducts();
        setProductos(data);
    }, []);

    const handleAddToCart = (product, sourceElement) => addItem(product, sourceElement);

    return (
        <main className="container my-5">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                <h2 className="text-center mb-0">Nuestro Catálogo Dinámico</h2>
            </div>

            {/* Grilla de productos dinámica */}
            <section className="row g-4 justify-content-center">
                {productos.length > 0 ? (
                    productos.map((prod) => {
                        const producto = aplicarOferta(prod);
                        return (
                        <div className="col-md-4" key={prod.id}>
                            {/* Llamamos a tu Molécula pasándole los props */}
                            <ProductCard 
                                {...producto}
                                onAddToCart={handleAddToCart}
                            />
                        </div>
                        );
                    })
                ) : (
                    <p className="text-center text-muted">No hay productos disponibles.</p>
                )}
            </section>
        </main>
    );
};

export default Productos;