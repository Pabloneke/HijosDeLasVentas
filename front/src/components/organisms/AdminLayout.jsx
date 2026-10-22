import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Estructura de la zona privada: menú lateral + contenido de la vista actual (<Outlet />).
// Se usa como "layout route" dentro de RutaProtegida, así que siempre hay un usuario en sesión.
const AdminLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Solo el administrador gestiona usuarios; el vendedor no ve ese acceso
    const esAdministrador = user?.tipo === 'administrador';

    // NavLink entrega isActive para resaltar la sección en la que estamos
    const claseItem = ({ isActive }) =>
        `list-group-item list-group-item-action border-secondary ${isActive ? 'active bg-primary text-white' : 'bg-dark text-white'}`;

    return (
        <div className="d-flex flex-column flex-md-row">
            <aside className="admin-sidebar bg-dark text-white flex-shrink-0">
                <div className="p-3 border-bottom border-secondary">
                    <strong>Hijos de las Ventas</strong>
                    <div className="small text-white-50">{user?.nombre} ({user?.tipo})</div>
                </div>
                <nav className="list-group list-group-flush" aria-label="Menú de administración">
                    <NavLink to="/admin" end className={claseItem}>Dashboard</NavLink>
                    <NavLink to="/admin/productos" className={claseItem}>Productos</NavLink>
                    {esAdministrador && (
                        <NavLink to="/admin/usuarios" className={claseItem}>Usuarios</NavLink>
                    )}
                    <NavLink to="/" className="list-group-item list-group-item-action bg-dark text-warning border-secondary">Volver a la tienda</NavLink>
                    <button type="button" className="list-group-item list-group-item-action bg-dark text-danger border-secondary" onClick={handleLogout}>
                        Cerrar sesión
                    </button>
                </nav>
            </aside>

            <main className="flex-grow-1 p-4">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
