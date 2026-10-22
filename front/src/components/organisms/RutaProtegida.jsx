import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Protege un grupo de rutas según el rol del usuario en sesión.
// roles: arreglo con los tipos que pueden entrar (ej: ['administrador', 'vendedor']).
// Sin sesión se envía al login; con sesión pero sin permiso, al inicio.
// Si se usa como "layout route" muestra las rutas hijas con <Outlet />.
const RutaProtegida = ({ roles, children }) => {
    const { user } = useAuth();

    if (!user) return <Navigate to="/login" replace />;
    if (!roles.includes(user.tipo)) return <Navigate to="/" replace />;

    return children ?? <Outlet />;
};

export default RutaProtegida;
