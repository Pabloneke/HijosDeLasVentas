import React from 'react';
import { numeroBoleta } from '../../utils/boleta';
import { desglosarIva, formatPrice, TASA_IVA } from '../../utils/precios';

const formatFecha = (iso) => new Intl.DateTimeFormat('es-CL', {
    dateStyle: 'long',
    timeStyle: 'short',
}).format(new Date(iso));

// Boleta de una compra ya registrada. Recibe la orden guardada (no el carrito, que se vacía
// al confirmar): { id, fecha, cliente, items, total, entrega? }
const Boleta = ({ orden }) => {
    const { neto, iva, total } = desglosarIva(orden.total);
    const entrega = orden.entrega;

    return (
        <article className="boleta" aria-label={`Boleta ${numeroBoleta(orden)}`}>
            <header className="boleta-header">
                <h3 className="boleta-title">Hijos de las Ventas</h3>
                <p className="boleta-subtitle">Boleta electrónica de demostración</p>
                <p className="boleta-number">N° {numeroBoleta(orden)}</p>
                <p className="boleta-meta">{formatFecha(orden.fecha)}</p>
            </header>

            <section className="boleta-section">
                <p><strong>Cliente:</strong> {orden.cliente?.nombre}</p>
                <p><strong>Correo:</strong> {orden.cliente?.correo}</p>
                {entrega && (
                    <p>
                        <strong>Entrega:</strong>{' '}
                        {entrega.modalidad === 'retiro'
                            ? 'Retiro coordinado'
                            : `Despacho a ${entrega.direccion}, ${entrega.comuna}, ${entrega.region}`}
                    </p>
                )}
            </section>

            <table className="boleta-table">
                <thead>
                    <tr>
                        <th scope="col">Producto</th>
                        <th scope="col" className="text-end">Cant.</th>
                        <th scope="col" className="text-end">P. unit.</th>
                        <th scope="col" className="text-end">Subtotal</th>
                    </tr>
                </thead>
                <tbody>
                    {orden.items.map((item) => (
                        <tr key={item.id}>
                            <td>{item.name}</td>
                            <td className="text-end">{item.quantity}</td>
                            <td className="text-end">{formatPrice(item.price)}</td>
                            <td className="text-end">{formatPrice(item.price * item.quantity)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <dl className="boleta-totals">
                <div><dt>Neto</dt><dd>{formatPrice(neto)}</dd></div>
                <div><dt>IVA ({Math.round(TASA_IVA * 100)}%)</dt><dd>{formatPrice(iva)}</dd></div>
                <div className="boleta-total"><dt>Total</dt><dd>{formatPrice(total)}</dd></div>
            </dl>

            <footer className="boleta-footer">
                Precios con IVA incluido. Documento de demostración sin validez tributaria.
            </footer>
        </article>
    );
};

export default Boleta;
