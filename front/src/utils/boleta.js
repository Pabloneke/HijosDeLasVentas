// Número de boleta/pedido a partir de la orden guardada (ej: id 7 -> "HV-000007")
export const numeroBoleta = (orden) => `HV-${String(orden.id).padStart(6, '0')}`;
