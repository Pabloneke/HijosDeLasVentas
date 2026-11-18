import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);
const SESSION_KEY = 'hijosdelasventas.auth';

function leerSesion() {
    try {
        const session = JSON.parse(localStorage.getItem(SESSION_KEY));
        return session?.accessToken && session.usuario && Number.isFinite(session.expiresAt) ? session : null;
    } catch {
        return null;
    }
}

export const AuthProvider = ({ children }) => {
    const [session, setSession] = useState(leerSesion);
    const actual = useRef(session);
    const renovacion = useRef(null);

    const guardarSesion = useCallback((data) => {
        const nueva = data ? {
            accessToken: data.accessToken,
            usuario: data.usuario,
            expiresAt: Date.now() + data.expiresIn * 1000,
        } : null;
        actual.current = nueva;
        if (nueva) localStorage.setItem(SESSION_KEY, JSON.stringify(nueva));
        else localStorage.removeItem(SESSION_KEY);
        setSession(nueva);
        return nueva;
    }, []);

    const renovar = useCallback((anterior) => {
        if (renovacion.current?.anterior === anterior) return renovacion.current.promise;
        const promise = api('/auth/refresh', { method: 'POST', headers: { 'X-Refresh-Token': '1' } })
            .then((data) => actual.current === anterior ? guardarSesion(data) : null)
            .catch((error) => {
                if (actual.current === anterior) guardarSesion(null);
                throw error;
            })
            .finally(() => {
                if (renovacion.current?.promise === promise) renovacion.current = null;
            });
        renovacion.current = { anterior, promise };
        return promise;
    }, [guardarSesion]);

    useEffect(() => {
        if (!session) return;
        const timer = setTimeout(() => { renovar(session).catch(() => {}); }, Math.max(0, session.expiresAt - Date.now()));
        return () => clearTimeout(timer);
    }, [session, renovar]);

    const login = async (correo, password) => {
        const data = await api('/auth/login', { method: 'POST', data: { correo, password } });
        return guardarSesion(data).usuario;
    };

    const registro = async (datos) => {
        const data = await api('/auth/registro', { method: 'POST', data: datos });
        return guardarSesion(data).usuario;
    };

    const consultar = useCallback(async (path) => {
        const anterior = actual.current;
        if (!anterior) throw new Error('Inicia sesión para continuar.');
        const solicitar = (sesion) => {
            if (!sesion) throw new Error('Tu sesión ya no es válida.');
            return api(path, { token: sesion.accessToken });
        };
        if (anterior.expiresAt <= Date.now()) return solicitar(await renovar(anterior));
        try {
            return await solicitar(anterior);
        } catch (error) {
            if (error.status !== 401) throw error;
            return solicitar(actual.current === anterior ? await renovar(anterior) : actual.current);
        }
    }, [renovar]);

    return (
        <AuthContext.Provider value={{
            user: session?.usuario ?? null,
            login,
            registro,
            logout: () => guardarSesion(null),
            consultar,
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
