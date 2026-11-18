// El backend devuelve las entidades JPA tal cual; estas dos funciones las llevan a la forma
// que ya esperan los componentes (así ProductCard, Boleta y ofertas.js no cambian).

// category llega como {id, nombre}; los componentes la pintan como texto
export const productoDesdeApi = (p) => ({ ...p, category: p.category?.nombre, categoryId: p.category?.id });

// Boleta del backend -> "orden" de Boleta.jsx
export const ordenDesdeBoleta = (b) => ({
    ...b,
    cliente: { userId: b.usuario?.id ?? null, nombre: b.clienteNombre, correo: b.clienteCorreo },
    items: b.items.map((d) => ({ id: d.producto.id, name: d.producto.name, price: d.price, quantity: d.quantity })),
    entrega: b.modalidadEntrega && {
        modalidad: b.modalidadEntrega, region: b.regionEntrega, comuna: b.comunaEntrega, direccion: b.direccionEntrega,
    },
});
