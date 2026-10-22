import React, { useRef, useState } from 'react';

const ProductCard = ({
    id,
    name,
    price,
    category,
    image,
    onAddToCart,
    originalPrice,
    discountPercentage,
}) => {
    const cardRef = useRef(null);
    const [added, setAdded] = useState(false);
    // Función para formatear el precio a pesos chilenos
    const formatPrice = (value) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            maximumFractionDigits: 0
        }).format(value);
    };

    const handleAdd = () => {
        onAddToCart({ id, name, price, image }, cardRef.current);
        setAdded(true);
        window.setTimeout(() => setAdded(false), 900);
    };

    const isOffer = Number.isFinite(originalPrice) && Number.isFinite(discountPercentage);

    return (
        <article ref={cardRef} className={`card h-100 shadow-sm border-0 ${isOffer ? 'offer-card' : ''}`}>
            {/* La imagen viene por props dinámica */}
            <div className="offer-image-wrapper">
                <img
                    src={image}
                    height="300"
                    width="300"
                    className="card-img-top"
                    alt={name}
                    style={{ objectFit: 'cover' }}
                />
                {isOffer && <span className="offer-ribbon">OFERTA</span>}
            </div>
            <div className="card-body d-flex flex-column text-center">
                <span className="badge bg-secondary mb-2 align-self-center">{category}</span>
                <h5 className="card-title fw-bold">{name}</h5>
                {isOffer ? (
                    <div className="mt-auto">
                        <div className="offer-prices">
                            <span className="offer-original-price">{formatPrice(originalPrice)}</span>
                            <span className="text-primary fw-bold offer-current-price">{formatPrice(price)}</span>
                        </div>
                        <span className="offer-discount">-{discountPercentage}%</span>
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
                    {added ? '¡Agregado!' : isOffer ? 'Agregar al carrito' : 'Lo quiero'}
                </button>
            </div>
        </article>
    );
};

export default ProductCard;