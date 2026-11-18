export const SESSION_KEY = 'hijosdelasventas.auth';
export const SESSION_EVENT = 'auth-session-change';

export function leerSesion() {
    try {
        const session = JSON.parse(localStorage.getItem(SESSION_KEY));
        return session?.accessToken && session.usuario && Number.isFinite(session.expiresAt) ? session : null;
    } catch {
        return null;
    }
}

export function guardarSesion(data) {
    const session = data ? {
        accessToken: data.accessToken,
        usuario: data.usuario,
        expiresAt: Date.now() + data.expiresIn * 1000,
    } : null;
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
    window.dispatchEvent(new Event(SESSION_EVENT));
    return session;
}
