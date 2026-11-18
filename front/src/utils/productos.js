// RF5: stock crítico cuando el stock es menor o igual al umbral
export const isStockCritico = (producto) => producto.stock <= producto.stockCritico;
