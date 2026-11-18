// Cliente HTTP del backend Spring Boot.
// shortcut: URL fija a localhost, pasarla a import.meta.env.VITE_API_URL al desplegar.
const BASE_URL = 'http://localhost:8080/api/v1';

// Contrato con AuthContext (Mau): clave del JWT y evento que avisa que la sesión expiró.
export const TOKEN_KEY = 'token';
export const EVENTO_SESION_EXPIRADA = 'sesion-expirada';

const request = async (method, ruta, body) => {
    const token = localStorage.getItem(TOKEN_KEY);
    const res = await fetch(`${BASE_URL}${ruta}`, {
        method,
        headers: {
            ...(body !== undefined && { 'Content-Type': 'application/json' }),
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
    });

    // 401 = token vencido. En /auth/* significa "credenciales incorrectas", no sesión expirada.
    if (res.status === 401 && !ruta.startsWith('/auth/')) {
        localStorage.removeItem(TOKEN_KEY);
        window.dispatchEvent(new Event(EVENTO_SESION_EXPIRADA));
    }

    const data = res.status === 204 ? null : await res.json().catch(() => null);
    if (!res.ok) {
        throw Object.assign(new Error(data?.message || data?.error || `Error ${res.status}`), { status: res.status });
    }
    return data;
};

export const api = {
    get: (ruta) => request('GET', ruta),
    post: (ruta, body) => request('POST', ruta, body),
    put: (ruta, body) => request('PUT', ruta, body),
    delete: (ruta) => request('DELETE', ruta),
};
