import React, { useEffect, useRef, useState } from 'react';

const ProductCard = ({ id, name, price, originalPrice, discountPercent, category, image, buttonLabel = 'Lo quiero', onAddToCart }) => {
    const imageRef = useRef(null);
    const confirmationTimeout = useRef(null);
    const [added, setAdded] = useState(false);
    // Función para formatear el precio a pesos chilenos
    const formatPrice = (value) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            maximumFractionDigits: 0
        }).format(value);
    };

    useEffect(() => () => {
        if (confirmationTimeout.current) clearTimeout(confirmationTimeout.current);
    }, []);

    const handleAdd = () => {
        const product = { id, name, price, image };
        if (onAddToCart.length > 1) onAddToCart(product, imageRef.current);
        else onAddToCart(product);
        setAdded(true);
        if (confirmationTimeout.current) clearTimeout(confirmationTimeout.current);
        confirmationTimeout.current = setTimeout(() => setAdded(false), 1200);
    };

    return (
        <article className="card h-100 shadow-sm border-0">
            {/* La imagen viene por props dinámica */}
            <img
            ref={imageRef}
                src={image} 
                height="300" 
                width="300" 
                className="card-img-top" 
                alt={name} 
                style={{ objectFit: 'cover' }} 
            />
            <div className="card-body d-flex flex-column text-center">
                <span className="badge bg-secondary mb-2 align-self-center">{category}</span>
                <h5 className="card-title fw-bold">{name}</h5>
                {originalPrice ? (
                    <div className="mt-auto">
                        <span className="badge bg-danger mb-2">-{discountPercent}%</span>
                        <div className="text-muted text-decoration-line-through">{formatPrice(originalPrice)}</div>
                        <h4 className="text-danger fw-bold mb-0">{formatPrice(price)}</h4>
                    </div>
                ) : (
                    <h4 className="text-primary fw-bold mt-auto">{formatPrice(price)}</h4>
                )}
                
                {/* Botón que ejecuta la función del carrito pasada por prop */}
                <button 
                    type="button" 
                    className="btn btn-outline-primary mt-3 fw-bold"
                    onClick={handleAdd}
                >
                    {added ? '¡Agregado!' : buttonLabel}
                </button>
            </div>
        </article>
    );
};

export default ProductCard;