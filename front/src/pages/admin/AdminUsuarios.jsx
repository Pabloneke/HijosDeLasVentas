import React, { useState } from 'react';
import FormField from '../../components/atoms/FormField';
import { useAuth } from '../../context/AuthContext';
import { getUsers, createUser, updateUser, deleteUser } from '../../services/db';
import { validarUsuarioAdmin } from '../../utils/validaciones';
import { REGIONES } from '../../utils/regiones';

const ETIQUETA_TIPO = { administrador: 'Administrador', vendedor: 'Vendedor', cliente: 'Cliente' };

const formVacio = {
    run: '', nombre: '', apellidos: '', correo: '', password: '',
    tipo: '', region: '', comuna: '', direccion: '',
};

// Mantenedor de usuarios (solo administrador, protegido por la ruta): tabla + formulario de creación/edición.
const AdminUsuarios = () => {
    const { user } = useAuth();

    const [usuarios, setUsuarios] = useState(() => getUsers());
    // null = formulario cerrado; { id: null } = usuario nuevo; { id: n } = editando al usuario n
    const [editando, setEditando] = useState(null);
    const [form, setForm] = useState(formVacio);
    const [errores, setErrores] = useState({});
    const [aviso, setAviso] = useState('');

    const recargar = () => setUsuarios(getUsers());

    const contarAdministradores = () => usuarios.filter((u) => u.tipo === 'administrador').length;

    const handleChange = (e) => setForm({ ...form, [e.target.id]: e.target.value });

    // Al cambiar la región se limpia la comuna, porque cada región tiene sus propias comunas
    const handleRegionChange = (e) => setForm({ ...form, region: e.target.value, comuna: '' });

    const abrirNuevo = () => {
        setForm(formVacio);
        setErrores({});
        setAviso('');
        setEditando({ id: null });
    };

    const abrirEdicion = (usuario) => {
        // La contraseña no se muestra: vacía significa "no cambiarla"
        setForm({ ...formVacio, ...usuario, password: '' });
        setErrores({});
        setAviso('');
        setEditando({ id: usuario.id });
    };

    const cerrarFormulario = () => {
        setEditando(null);
        setErrores({});
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const esEdicion = editando.id !== null;

        const erroresForm = validarUsuarioAdmin(form, { editando: esEdicion });

        // El RUN identifica a la persona: no puede repetirse entre usuarios
        const run = form.run.trim().toUpperCase();
        if (!erroresForm.run && usuarios.some((u) => u.run === run && u.id !== editando.id)) {
            erroresForm.run = 'Ya existe un usuario con ese RUN';
        }

        // Siempre debe quedar al menos un administrador que pueda entrar al panel
        const actual = usuarios.find((u) => u.id === editando.id);
        if (esEdicion && actual?.tipo === 'administrador' && form.tipo !== 'administrador' && contarAdministradores() === 1) {
            erroresForm.tipo = 'Debe quedar al menos un administrador';
        }

        setErrores(erroresForm);
        if (Object.keys(erroresForm).length > 0) return;

        const datos = {
            run,
            nombre: form.nombre.trim(),
            apellidos: form.apellidos.trim(),
            correo: form.correo.trim(),
            tipo: form.tipo,
            direccion: form.direccion.trim(),
            region: form.region,
            comuna: form.comuna,
            ...(form.password && { password: form.password }),
        };

        try {
            if (esEdicion) updateUser(editando.id, datos);
            else createUser(datos);
        } catch (error) {
            // Único error posible: el correo ya pertenece a otro usuario
            setErrores({ correo: error.message });
            return;
        }

        setAviso('');
        recargar();
        cerrarFormulario();
    };

    const handleEliminar = (usuario) => {
        if (usuario.id === user?.id) {
            setAviso('No puedes eliminar tu propia cuenta.');
            return;
        }
        if (usuario.tipo === 'administrador' && contarAdministradores() === 1) {
            setAviso('Debe quedar al menos un administrador.');
            return;
        }
        if (!window.confirm(`¿Eliminar a ${usuario.nombre} ${usuario.apellidos}?`)) return;

        deleteUser(usuario.id);
        setAviso('');
        recargar();
    };

    const comunas = REGIONES[form.region] || [];

    return (
        <>
            <div className="admin-page-heading d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
                <div>
                    <span className="admin-eyebrow">Accesos y permisos</span>
                    <h2 className="mb-0">Usuarios</h2>
                </div>
                {!editando && (
                    <button type="button" className="btn btn-primary fw-bold" onClick={abrirNuevo}>+ Nuevo usuario</button>
                )}
            </div>

            {aviso && <div className="alert alert-warning" role="alert">{aviso}</div>}

            <section className="admin-panel p-3 p-lg-4 mb-4">
                {usuarios.length > 0 ? (
                    <div className="table-responsive">
                        <table className="table table-striped table-hover align-middle mb-0" aria-label="Usuarios">
                            <thead className="table-dark">
                                <tr>
                                    <th>RUN</th>
                                    <th>Nombre</th>
                                    <th>Apellidos</th>
                                    <th>Correo</th>
                                    <th>Tipo</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usuarios.map((usuario) => (
                                    <tr key={usuario.id}>
                                        <td>{usuario.run}</td>
                                        <td>{usuario.nombre}</td>
                                        <td>{usuario.apellidos}</td>
                                        <td>{usuario.correo}</td>
                                        <td>{ETIQUETA_TIPO[usuario.tipo] ?? usuario.tipo}</td>
                                        <td>
                                            <button type="button" className="btn btn-sm btn-outline-primary me-2"
                                                aria-label={`Editar ${usuario.correo}`} onClick={() => abrirEdicion(usuario)}>Editar</button>
                                            <button type="button" className="btn btn-sm btn-outline-danger"
                                                aria-label={`Eliminar ${usuario.correo}`} onClick={() => handleEliminar(usuario)}>Eliminar</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-muted mb-0">No hay usuarios registrados.</p>
                )}
            </section>

            {editando && (
                <section className="admin-panel p-3 p-lg-4">
                    <h3 className="h5 mb-3">{editando.id === null ? 'Nuevo usuario' : 'Editar usuario'}</h3>
                    <form onSubmit={handleSubmit} noValidate>
                        <div className="row">
                            <div className="col-md-6">
                                <FormField id="run" label="RUN" placeholder="Sin puntos ni guion, ej: 190110222" maxLength={9}
                                    disabled={editando.id !== null} value={form.run} onChange={handleChange} error={errores.run} />
                            </div>
                            <div className="col-md-6">
                                <FormField id="tipo" label="Tipo de usuario" as="select" value={form.tipo} onChange={handleChange} error={errores.tipo}>
                                    <option value="">-- Seleccione --</option>
                                    <option value="administrador">Administrador</option>
                                    <option value="vendedor">Vendedor</option>
                                    <option value="cliente">Cliente</option>
                                </FormField>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-6">
                                <FormField id="nombre" label="Nombre" value={form.nombre} onChange={handleChange} error={errores.nombre} />
                            </div>
                            <div className="col-md-6">
                                <FormField id="apellidos" label="Apellidos" value={form.apellidos} onChange={handleChange} error={errores.apellidos} />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-6">
                                <FormField id="correo" label="Correo electrónico" type="email" value={form.correo} onChange={handleChange} error={errores.correo} />
                            </div>
                            <div className="col-md-6">
                                <FormField id="password" label={editando.id === null ? 'Contraseña' : 'Contraseña (vacía = no cambiarla)'} type="password" maxLength={10}
                                    value={form.password} onChange={handleChange} error={errores.password} />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-6">
                                <FormField id="region" label="Región" as="select" value={form.region} onChange={handleRegionChange} error={errores.region}>
                                    <option value="">-- Seleccione la región --</option>
                                    {Object.keys(REGIONES).map((region) => (
                                        <option key={region} value={region}>{region}</option>
                                    ))}
                                </FormField>
                            </div>
                            <div className="col-md-6">
                                <FormField id="comuna" label="Comuna" as="select" disabled={comunas.length === 0} value={form.comuna} onChange={handleChange} error={errores.comuna}>
                                    <option value="">-- Seleccione la comuna --</option>
                                    {comunas.map((comuna) => (
                                        <option key={comuna} value={comuna}>{comuna}</option>
                                    ))}
                                </FormField>
                            </div>
                        </div>
                        <FormField id="direccion" label="Dirección" value={form.direccion} onChange={handleChange} error={errores.direccion} />

                        <button type="submit" className="btn btn-primary fw-bold me-2">Guardar usuario</button>
                        <button type="button" className="btn btn-outline-secondary" onClick={cerrarFormulario}>Cancelar</button>
                    </form>
                </section>
            )}
        </>
    );
};

export default AdminUsuarios;
