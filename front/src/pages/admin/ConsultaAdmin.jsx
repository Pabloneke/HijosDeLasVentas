import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../utils/precios';

const consultas = {
    productos: {
        titulo: 'Productos',
        columnas: ['ID', 'Nombre', 'Precio', 'Stock', 'Categoría'],
        valores: (producto) => [
            producto.id, producto.name, formatPrice(producto.price), producto.stock,
            producto.categoria?.nombre ?? producto.category ?? '',
        ],
    },
    ordenes: {
        titulo: 'Órdenes',
        columnas: ['ID', 'Fecha', 'Cliente', 'Total'],
        valores: (orden) => [
            orden.id, new Date(orden.fecha).toLocaleDateString('es-CL'),
            orden.clienteNombre, formatPrice(orden.total),
        ],
    },
};

export default function ConsultaAdmin({ recurso }) {
    const { consultar } = useAuth();
    const { titulo, columnas, valores } = consultas[recurso];
    const [resultado, setResultado] = useState(null);

    useEffect(() => {
        let activo = true;
        consultar('/' + recurso).then(
            (filas) => { if (activo) setResultado({ filas }); },
            (error) => { if (activo) setResultado({ error: error.message }); },
        );
        return () => { activo = false; };
    }, [consultar, recurso]);

    return (
        <>
            <div className="admin-page-heading mb-4"><h2 className="mb-0">{titulo}</h2></div>
            <section className="admin-panel p-3 p-lg-4">
                {!resultado && <p role="status">Cargando…</p>}
                {resultado?.error && <p className="alert alert-danger mb-0" role="alert">{resultado.error}</p>}
                {resultado?.filas?.length === 0 && <p className="text-muted mb-0">No hay registros.</p>}
                {resultado?.filas?.length > 0 && (
                    <div className="table-responsive">
                        <table className="table table-striped align-middle mb-0" aria-label={titulo}>
                            <thead className="table-dark">
                                <tr>{columnas.map((columna) => <th key={columna}>{columna}</th>)}</tr>
                            </thead>
                            <tbody>
                                {resultado.filas.map((fila) => (
                                    <tr key={fila.id}>
                                        {valores(fila).map((valor, i) => <td key={columnas[i]}>{valor}</td>)}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </>
    );
}
