import { createContext, useContext, useState } from 'react';
import { getSession, login as dbLogin, logout as dbLogout } from '../services/db';

const AuthContext = createContext(null);

// Entrega el usuario en sesión a toda la app. El estado nace de la sesión guardada,
// así al recargar la página el usuario sigue "logueado".
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => getSession());

    // Lanza Error si las credenciales no coinciden (el formulario lo muestra)
    const login = (correo, password) => {
        const sesion = dbLogin(correo, password);
        setUser(sesion);
        return sesion;
    };

    const logout = () => {
        dbLogout();
        setUser(null);
    };

    return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const contexto = useContext(AuthContext);
    if (!contexto) throw new Error('useAuth debe usarse dentro de un AuthProvider');
    return contexto;
};
