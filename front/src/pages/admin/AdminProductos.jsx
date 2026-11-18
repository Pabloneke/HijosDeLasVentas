import React, { useEffect, useState } from 'react';
import FormField from '../../components/atoms/FormField';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { productoDesdeApi } from '../../services/adaptadores';
import { isStockCritico } from '../../utils/productos';
import { validarProducto } from '../../utils/validaciones';
import { formatPrice } from '../../utils/precios';

const formVacio = { name: '', price: '', stock: '', stockCritico: '', category: '', image: '' };

// Mantenedor de productos: tabla + formulario de creación/edición.
// El administrador puede crear, editar y eliminar; el vendedor solo consulta el catálogo y su stock.
const AdminProductos = () => {
    const { user } = useAuth();
    const esAdministrador = user?.tipo === 'administrador';

    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    // null = formulario cerrado; { id: null } = producto nuevo; { id: n } = editando el producto n
    const [editando, setEditando] = useState(null);
    const [form, setForm] = useState(formVacio);
    const [errores, setErrores] = useState({});
    const [alertaStock, setAlertaStock] = useState('');
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        Promise.all([api.get('/productos'), api.get('/categorias')])
            .then(([listaProductos, listaCategorias]) => {
                setProductos(listaProductos.map(productoDesdeApi));
                setCategorias(listaCategorias);
            })
            .catch((e) => setAlertaStock(e.message));
    }, []);

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
            category: String(producto.categoryId),
            image: producto.image ?? '',
        });
        setErrores({});
        setEditando({ id: producto.id });
    };

    const cerrarFormulario = () => {
        setEditando(null);
        setErrores({});
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (guardando) return;

        const erroresForm = validarProducto(form);
        setErrores(erroresForm);
        if (Object.keys(erroresForm).length > 0) return;

        const datos = {
            name: form.name.trim(),
            price: Number(form.price),
            stock: Number(form.stock),
            stockCritico: form.stockCritico.trim() === '' ? 0 : Number(form.stockCritico),
            category: { id: Number(form.category) },
            image: form.image.trim() || '/img/logo.png',
        };

        setGuardando(true);
        try {
            const guardado = productoDesdeApi(editando.id === null
                ? await api.post('/productos', datos)
                : await api.put(`/productos/${editando.id}`, { ...datos, id: editando.id }));
            setProductos(editando.id === null
                ? [...productos, guardado]
                : productos.map((p) => (p.id === guardado.id ? guardado : p)));

            // RF5: avisa si el stock ingresado quedó igual o bajo el umbral crítico
            setAlertaStock(
                isStockCritico(guardado)
                    ? `Atención: el stock de "${guardado.name}" (${guardado.stock}) quedó igual o por debajo del stock crítico (${guardado.stockCritico}).`
                    : ''
            );
            cerrarFormulario();
        } catch (error) {
            setAlertaStock(error.message); // reutiliza la alerta para mostrar el error del backend
        } finally {
            setGuardando(false);
        }
    };

    const handleEliminar = async (producto) => {
        if (!window.confirm(`¿Eliminar "${producto.name}" del catálogo?`)) return;
        try {
            await api.delete(`/productos/${producto.id}`);
            setProductos(productos.filter((p) => p.id !== producto.id));
            setAlertaStock('');
        } catch (error) {
            setAlertaStock(error.message);
        }
    };

    return (
        <>
            <div className="admin-page-heading d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
                <div>
                    <span className="admin-eyebrow">Catálogo y existencias</span>
                    <h2 className="mb-0">Productos</h2>
                </div>
                {esAdministrador && !editando && (
                    <button type="button" className="btn btn-primary fw-bold" onClick={abrirNuevo}>+ Nuevo producto</button>
                )}
            </div>

            {alertaStock && <div className="alert alert-warning" role="alert">{alertaStock}</div>}

            <section className="admin-panel p-3 p-lg-4 mb-4">
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
                <section className="admin-panel p-3 p-lg-4">
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
                            {categorias.map((categoria) => (
                                <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>
                            ))}
                        </FormField>
                        <FormField id="image" label="Ruta de la imagen (opcional)" placeholder="/img/logo.png" value={form.image} onChange={handleChange} error={errores.image} />

                        <button type="submit" className="btn btn-primary fw-bold me-2" disabled={guardando}>Guardar producto</button>
                        <button type="button" className="btn btn-outline-secondary" onClick={cerrarFormulario}>Cancelar</button>
                    </form>
                </section>
            )}
        </>
    );
};

export default AdminProductos;
