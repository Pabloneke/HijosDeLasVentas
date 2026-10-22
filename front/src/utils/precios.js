// Utilidades de precios compartidas por tarjetas, panel admin y (más adelante) carrito y checkout.

// Formatea un número a pesos chilenos (ej: 65000 -> "$65.000")
export const formatPrice = (value) =>
    new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0,
    }).format(value);
