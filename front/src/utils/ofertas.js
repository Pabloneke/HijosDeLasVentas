// El descuento viene del backend (Producto.descuento, porcentaje de 0 a 90; null = sin oferta).
// La formula es la misma de BoletaService, asi lo que se muestra es lo que se cobra.
export const aplicarOferta = (producto) => {
    const discountPercent = producto.descuento;
    if (!discountPercent) return producto;

    return {
        ...producto,
        originalPrice: producto.price,
        price: Math.round(producto.price * (100 - discountPercent) / 100),
        discountPercent,
    };
};

export const crearOfertas = (productos) => productos
    .filter((producto) => producto.descuento)
    .map(aplicarOferta);
