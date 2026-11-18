import React, { useEffect, useState } from 'react';
import Boleta from '../../components/organisms/Boleta';
import { api } from '../../services/api';
import { ordenDesdeBoleta } from '../../services/adaptadores';
import { numeroBoleta } from '../../utils/boleta';
import { formatPrice } from '../../utils/precios';

// Solo lectura: administrador y vendedor consultan las órdenes, nadie las crea ni edita.
// shortcut: el detalle usa la boleta ya cargada en la lista; pasar a GET /boletas/{id} si la lista deja de traer los ítems.
const AdminOrdenes = () => {
    const [ordenes, setOrdenes] = useState([]);
    const [seleccionada, setSeleccionada] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/boletas')
            .then((boletas) => setOrdenes(boletas.map(ordenDesdeBoleta)))
            .catch((e) => setError(e.message));
    }, []);

    return (
        <>
            <div className="admin-page-heading mb-4">
                <div>
                    <span className="admin-eyebrow">Ventas</span>
                    <h2 className="mb-0">Órdenes</h2>
                </div>
            </div>

            {error && <div className="alert alert-danger" role="alert">{error}</div>}

            <section className="admin-panel p-3 p-lg-4 mb-4">
                {ordenes.length > 0 ? (
                    <div className="table-responsive">
                        <table className="table table-striped table-hover align-middle mb-0" aria-label="Órdenes">
                            <thead className="table-dark">
                                <tr>
                                    <th>N°</th>
                                    <th>Fecha</th>
                                    <th>Cliente</th>
                                    <th>Total</th>
                                    <th>Detalle</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ordenes.map((orden) => (
                                    <tr key={orden.id}>
                                        <td>{numeroBoleta(orden)}</td>
                                        <td>{new Date(orden.fecha).toLocaleDateString('es-CL')}</td>
                                        <td>{orden.cliente.nombre}<div className="small text-muted">{orden.cliente.correo}</div></td>
                                        <td>{formatPrice(orden.total)}</td>
                                        <td>
                                            <button type="button" className="btn btn-sm btn-outline-primary"
                                                aria-label={`Ver detalle ${numeroBoleta(orden)}`} onClick={() => setSeleccionada(orden)}>Ver detalle</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    !error && <p className="text-muted mb-0">Aún no hay órdenes registradas.</p>
                )}
            </section>

            {seleccionada && (
                <section className="admin-panel p-3 p-lg-4">
                    <button type="button" className="btn btn-outline-secondary mb-3" onClick={() => setSeleccionada(null)}>Cerrar</button>
                    <div className="boleta-wrapper"><Boleta orden={seleccionada} /></div>
                </section>
            )}
        </>
    );
};

export default AdminOrdenes;
