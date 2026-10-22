// Descuentos promocionales de demostración asociados a productos reales del catálogo.
// Esta configuración no modifica los precios persistidos en la base de productos.
export const DESCUENTOS = {
    1: 20,
    3: 15,
    5: 25,
    6: 10,
};

export const aplicarOferta = (producto) => {
    const discountPercent = DESCUENTOS[producto.id];
    if (!discountPercent) return producto;

    return {
        ...producto,
        originalPrice: producto.price,
        price: Math.round(producto.price * (1 - discountPercent / 100)),
        discountPercent,
    };
};

export const crearOfertas = (productos) => productos
    .filter((producto) => DESCUENTOS[producto.id])
    .map(aplicarOferta);
