import { createContext, useContext, useEffect, useState } from 'react';
import { api, renovarSesion } from '../services/api';
import { guardarSesion, leerSesion, SESSION_EVENT, SESSION_KEY } from '../services/sesion';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [session, setSession] = useState(leerSesion);

    useEffect(() => {
        const sincronizar = (event) => {
            if (event.type !== 'storage' || event.key === SESSION_KEY || event.key === null) {
                setSession(leerSesion());
            }
        };
        window.addEventListener(SESSION_EVENT, sincronizar);
        window.addEventListener('storage', sincronizar);
        return () => {
            window.removeEventListener(SESSION_EVENT, sincronizar);
            window.removeEventListener('storage', sincronizar);
        };
    }, []);

    useEffect(() => {
        if (!session) return;
        const timer = setTimeout(() => { renovarSesion(session).catch(() => {}); }, Math.max(0, session.expiresAt - Date.now()));
        return () => clearTimeout(timer);
    }, [session]);

    const iniciar = async (ruta, datos) => guardarSesion(await api.post(ruta, datos)).usuario;
    return (
        <AuthContext.Provider value={{
            user: session?.usuario ?? null,
            login: (correo, password) => iniciar('/auth/login', { correo, password }),
            registro: (datos) => iniciar('/auth/registro', datos),
            logout: () => guardarSesion(null),
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const contexto = useContext(AuthContext);
    if (!contexto) throw new Error('useAuth debe usarse dentro de un AuthProvider');
    return contexto;
};
