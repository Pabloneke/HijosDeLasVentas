import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getProducts, getUsers, getUserById, getOrders, isStockCritico } from '../../services/db';
import { formatPrice } from '../../utils/precios';

const formatFecha = (iso) => new Date(iso).toLocaleDateString('es-CL');

// Agrupa las órdenes por cliente: cuántas compras hizo, cuánto gastó y cuándo fue la última.
// Las compras sin sesión (userId null) se juntan en una sola fila "Invitado".
const resumirComprasPorUsuario = (ordenes) => {
    const grupos = new Map();
    ordenes.forEach((orden) => {
        const userId = orden.cliente?.userId ?? null;
        const grupo = grupos.get(userId) ?? { userId, compras: 0, total: 0, ultima: orden.fecha };
        grupo.compras += 1;
        grupo.total += orden.total;
        if (orden.fecha > grupo.ultima) grupo.ultima = orden.fecha;
        grupos.set(userId, grupo);
    });

    return [...grupos.values()]
        .map((grupo) => {
            const usuario = grupo.userId === null ? null : getUserById(grupo.userId);
            let nombre = 'Invitado';
            if (grupo.userId !== null) {
                nombre = usuario ? `${usuario.nombre} ${usuario.apellidos}`.trim() : 'Usuario eliminado';
            }
            return { ...grupo, nombre, correo: usuario?.correo ?? '' };
        })
        .sort((a, b) => b.ultima.localeCompare(a.ultima));
};

const MetricCard = ({ label, value, destacada }) => (
    <div className="col-6 col-lg-3">
        <div className={`p-3 bg-white shadow-sm rounded h-100 border-start border-4 ${destacada ? 'border-warning' : 'border-primary'}`}>
            <span className="d-block text-muted">{label}</span>
            <div className="fs-3 fw-bold">{value}</div>
        </div>
    </div>
);

const AdminDashboard = () => {
    const { user } = useAuth();

    // Los datos se leen de la "base de datos" en cada render: son pocos y viven en localStorage
    const productos = getProducts();
    const stockCritico = productos.filter(isStockCritico);
    const ordenes = getOrders();
    const comprasPorUsuario = resumirComprasPorUsuario(ordenes);

    return (
        <>
            <h2 className="mb-4">¡Hola, {user?.nombre}!</h2>

            <section className="row g-3 mb-4" aria-label="Resumen">
                <MetricCard label="Productos activos" value={productos.length} />
                <MetricCard label="Usuarios registrados" value={getUsers().length} />
                <MetricCard label="Con stock crítico" value={stockCritico.length} destacada />
                <MetricCard label="Compras realizadas" value={ordenes.length} />
            </section>

            <section className="bg-white p-4 shadow-sm rounded mb-4">
                <h3 className="h5 mb-3">Productos con stock crítico</h3>
                {stockCritico.length > 0 ? (
                    <div className="table-responsive">
                        <table className="table table-striped align-middle mb-0" aria-label="Stock crítico">
                            <thead className="table-dark">
                                <tr>
                                    <th>Producto</th>
                                    <th>Categoría</th>
                                    <th>Stock</th>
                                    <th>Stock crítico</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stockCritico.map((producto) => (
                                    <tr key={producto.id}>
                                        <td>{producto.name}</td>
                                        <td>{producto.category}</td>
                                        <td><span className="badge bg-danger">{producto.stock}</span></td>
                                        <td>{producto.stockCritico}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-muted mb-0">Sin productos en stock crítico.</p>
                )}
            </section>

            <section className="bg-white p-4 shadow-sm rounded mb-4">
                <h3 className="h5 mb-3">Historial de compras por usuario</h3>
                {comprasPorUsuario.length > 0 ? (
                    <div className="table-responsive">
                        <table className="table table-striped align-middle mb-0" aria-label="Historial de compras">
                            <thead className="table-dark">
                                <tr>
                                    <th>Usuario</th>
                                    <th>Compras</th>
                                    <th>Total gastado</th>
                                    <th>Última compra</th>
                                </tr>
                            </thead>
                            <tbody>
                                {comprasPorUsuario.map((fila) => (
                                    <tr key={fila.userId ?? 'invitado'}>
                                        <td>
                                            {fila.nombre}
                                            {fila.correo && <div className="small text-muted">{fila.correo}</div>}
                                        </td>
                                        <td>{fila.compras}</td>
                                        <td>{formatPrice(fila.total)}</td>
                                        <td>{formatFecha(fila.ultima)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-muted mb-0">Aún no hay compras registradas.</p>
                )}
            </section>

            <section className="bg-white p-4 shadow-sm rounded">
                <h3 className="h5 mb-3">Accesos rápidos</h3>
                <Link to="/admin/productos" className="btn btn-outline-primary me-2">Ver productos</Link>
                {user?.tipo === 'administrador' && (
                    <Link to="/admin/usuarios" className="btn btn-outline-primary">Ver usuarios</Link>
                )}
            </section>
        </>
    );
};

export default AdminDashboard;
