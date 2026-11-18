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
        credentials: 'include', // el backend entrega el refresh token en una cookie HttpOnly (/auth/login, /auth/refresh)
    });

    // 401 = token vencido. En /auth/* significa "credenciales incorrectas", no sesión expirada.
    if (res.status === 401 && !ruta.startsWith('/auth/')) {
        localStorage.removeItem(TOKEN_KEY);
        window.dispatchEvent(new Event(EVENTO_SESION_EXPIRADA));
    }

    // El cuerpo puede venir vacío (204, o 200 de un DELETE), en JSON o en texto plano (ej. el 400 de POST /boletas).
    const texto = res.status === 204 ? '' : await res.text();
    let data = texto;
    try { data = JSON.parse(texto); } catch { /* texto plano o vacío: se deja tal cual */ }
    if (!res.ok) {
        const mensaje = typeof data === 'string' ? data : data?.message || data?.error;
        throw Object.assign(new Error(mensaje || `Error ${res.status}`), { status: res.status });
    }
    return data === '' ? null : data;
};

export const api = {
    get: (ruta) => request('GET', ruta),
    post: (ruta, body) => request('POST', ruta, body),
    put: (ruta, body) => request('PUT', ruta, body),
    delete: (ruta) => request('DELETE', ruta),
};
