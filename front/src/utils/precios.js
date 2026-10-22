// Utilidades de precios compartidas por tarjetas, panel admin y (más adelante) carrito y checkout.

// Formatea un número a pesos chilenos (ej: 65000 -> "$65.000")
export const formatPrice = (value) =>
    new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0,
    }).format(value);

export const TASA_IVA = 0.19;

// Separa un total que ya incluye IVA en neto + IVA (el IVA se calcula por diferencia,
// así neto + iva siempre suma exactamente el total). Ej: 119000 -> { neto: 100000, iva: 19000 }
export const desglosarIva = (totalConIva, tasa = TASA_IVA) => {
    const total = Math.round(Number(totalConIva) || 0);
    const neto = Math.round(total / (1 + tasa));
    return { neto, iva: total - neto, total };
};
