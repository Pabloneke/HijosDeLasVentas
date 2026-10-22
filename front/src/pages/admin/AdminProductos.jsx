import React, { useState } from 'react';
import FormField from '../../components/atoms/FormField';
import { useAuth } from '../../context/AuthContext';
import {
    CATEGORIAS, getProducts, createProduct, updateProduct, deleteProduct, isStockCritico,
} from '../../services/db';
import { validarProducto } from '../../utils/validaciones';
import { formatPrice } from '../../utils/precios';

const formVacio = { name: '', price: '', stock: '', stockCritico: '', category: '', image: '' };

// Mantenedor de productos: tabla + formulario de creación/edición.
// El administrador puede crear, editar y eliminar; el vendedor solo consulta el catálogo y su stock.
const AdminProductos = () => {
    const { user } = useAuth();
    const esAdministrador = user?.tipo === 'administrador';

    const [productos, setProductos] = useState(() => getProducts());
    // null = formulario cerrado; { id: null } = producto nuevo; { id: n } = editando el producto n
    const [editando, setEditando] = useState(null);
    const [form, setForm] = useState(formVacio);
    const [errores, setErrores] = useState({});
    const [alertaStock, setAlertaStock] = useState('');

    const recargar = () => setProductos(getProducts());

    const handleChange = (e) => setForm({ ...form, [e.target.id]: e.target.value });

    const abrirNuevo = () => {
        setForm(formVacio);
        setErrores({});
        setEditando({ id: null });
    };

    const abrirEdicion = (producto) => {
        setForm({
            name: producto.name,
            price: String(producto.price),
            stock: String(producto.stock ?? 0),
            stockCritico: String(producto.stockCritico ?? 0),
            category: producto.category,
            image: producto.image ?? '',
        });
        setErrores({});
        setEditando({ id: producto.id });
    };

    const cerrarFormulario = () => {
        setEditando(null);
        setErrores({});
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const erroresForm = validarProducto(form);
        setErrores(erroresForm);
        if (Object.keys(erroresForm).length > 0) return;

        const datos = {
            name: form.name.trim(),
            price: Number(form.price),
            stock: Number(form.stock),
            stockCritico: form.stockCritico.trim() === '' ? 0 : Number(form.stockCritico),
            category: form.category,
            ...(form.image.trim() && { image: form.image.trim() }),
        };

        const guardado = editando.id === null
            ? createProduct(datos)
            : updateProduct(editando.id, datos);

        // RF5: avisa si el stock ingresado quedó igual o bajo el umbral crítico
        setAlertaStock(
            guardado && isStockCritico(guardado)
                ? `Atención: el stock de "${guardado.name}" (${guardado.stock}) quedó igual o por debajo del stock crítico (${guardado.stockCritico}).`
                : ''
        );
        recargar();
        cerrarFormulario();
    };

    const handleEliminar = (producto) => {
        if (!window.confirm(`¿Eliminar "${producto.name}" del catálogo?`)) return;
        deleteProduct(producto.id);
        setAlertaStock('');
        recargar();
    };

    return (
        <>
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
                <h2 className="mb-0">Productos</h2>
                {esAdministrador && !editando && (
                    <button type="button" className="btn btn-primary fw-bold" onClick={abrirNuevo}>+ Nuevo producto</button>
                )}
            </div>

            {alertaStock && <div className="alert alert-warning" role="alert">{alertaStock}</div>}

            <section className="bg-white p-4 shadow-sm rounded mb-4">
                {productos.length > 0 ? (
                    <div className="table-responsive">
                        <table className="table table-striped table-hover align-middle mb-0" aria-label="Productos">
                            <thead className="table-dark">
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Precio</th>
                                    <th>Stock</th>
                                    <th>Categoría</th>
                                    {esAdministrador && <th>Acciones</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {productos.map((producto) => (
                                    <tr key={producto.id}>
                                        <td>{producto.id}</td>
                                        <td>{producto.name}</td>
                                        <td>{formatPrice(producto.price)}</td>
                                        <td>
                                            <span className={`badge ${isStockCritico(producto) ? 'bg-danger' : 'bg-success'}`}>{producto.stock}</span>
                                        </td>
                                        <td>{producto.category}</td>
                                        {esAdministrador && (
                                            <td>
                                                <button type="button" className="btn btn-sm btn-outline-primary me-2"
                                                    aria-label={`Editar ${producto.name}`} onClick={() => abrirEdicion(producto)}>Editar</button>
                                                <button type="button" className="btn btn-sm btn-outline-danger"
                                                    aria-label={`Eliminar ${producto.name}`} onClick={() => handleEliminar(producto)}>Eliminar</button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-muted mb-0">No hay productos registrados.</p>
                )}
            </section>

            {esAdministrador && editando && (
                <section className="bg-white p-4 shadow-sm rounded">
                    <h3 className="h5 mb-3">{editando.id === null ? 'Nuevo producto' : 'Editar producto'}</h3>
                    {/* noValidate: las validaciones las hace React, con mensajes propios */}
                    <form onSubmit={handleSubmit} noValidate>
                        <FormField id="name" label="Nombre" value={form.name} onChange={handleChange} error={errores.name} />
                        <div className="row">
                            <div className="col-md-4">
                                <FormField id="price" label="Precio" type="number" min="0" value={form.price} onChange={handleChange} error={errores.price} />
                            </div>
                            <div className="col-md-4">
                                <FormField id="stock" label="Stock" type="number" min="0" step="1" value={form.stock} onChange={handleChange} error={errores.stock} />
                            </div>
                            <div className="col-md-4">
                                <FormField id="stockCritico" label="Stock crítico (opcional)" type="number" min="0" step="1" value={form.stockCritico} onChange={handleChange} error={errores.stockCritico} />
                            </div>
                        </div>
                        <FormField id="category" label="Categoría" as="select" value={form.category} onChange={handleChange} error={errores.category}>
                            <option value="">-- Seleccione categoría --</option>
                            {CATEGORIAS.map((categoria) => (
                                <option key={categoria} value={categoria}>{categoria}</option>
                            ))}
                        </FormField>
                        <FormField id="image" label="Ruta de la imagen (opcional)" placeholder="/img/logo.png" value={form.image} onChange={handleChange} error={errores.image} />

                        <button type="submit" className="btn btn-primary fw-bold me-2">Guardar producto</button>
                        <button type="button" className="btn btn-outline-secondary" onClick={cerrarFormulario}>Cancelar</button>
                    </form>
                </section>
            )}
        </>
    );
};

export default AdminProductos;
