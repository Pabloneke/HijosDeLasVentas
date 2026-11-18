import { guardarSesion, leerSesion } from './sesion';

const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1').replace(/\/$/, '');

async function request(path, { method = 'GET', data, token, headers = {} } = {}) {
    let response;
    try {
        response = await fetch(baseUrl + path, {
            method,
            credentials: 'include',
            headers: {
                Accept: 'application/json',
                ...(data !== undefined && { 'Content-Type': 'application/json' }),
                ...(token && { Authorization: 'Bearer ' + token }),
                ...headers,
            },
            ...(data !== undefined && { body: JSON.stringify(data) }),
        });
    } catch {
        throw new Error('No se pudo conectar con el servidor.');
    }

    const payload = response.status === 204 ? null : await response.json().catch(() => null);
    if (!response.ok) {
        const mensajes = {
            400: 'Revisa los datos ingresados.',
            401: 'Tu sesión ya no es válida.',
            403: 'No tienes permiso para realizar esta operación.',
            409: 'El correo o RUN ya está registrado.',
        };
        const message = path === '/auth/login' && response.status === 401
            ? 'Correo o contraseña incorrectos'
            : payload?.message || mensajes[response.status] || payload?.error || 'El servidor no pudo completar la solicitud.';
        throw Object.assign(new Error(message), { status: response.status });
    }
    return payload;
}

let renovacion;
export function renovarSesion(anterior) {
    if (renovacion?.token === anterior.accessToken) return renovacion.promise;
    const sigueVigente = () => leerSesion()?.accessToken === anterior.accessToken;
    const promise = request('/auth/refresh', { method: 'POST', headers: { 'X-Refresh-Token': '1' } })
        .then((data) => sigueVigente() ? guardarSesion(data) : null)
        .catch((error) => {
            if (sigueVigente()) guardarSesion(null);
            throw error;
        })
        .finally(() => {
            if (renovacion?.promise === promise) renovacion = undefined;
        });
    renovacion = { token: anterior.accessToken, promise };
    return promise;
}

async function solicitar(path, options) {
    if (path.startsWith('/auth/')) return request(path, options);
    const session = leerSesion();
    if (!session) return request(path, options);

    const enviar = (actual) => {
        if (!actual) throw new Error('Tu sesión ya no es válida.');
        return request(path, { ...options, token: actual.accessToken });
    };
    if (session.expiresAt <= Date.now()) return enviar(await renovarSesion(session));

    try {
        return await enviar(session);
    } catch (error) {
        if (error.status !== 401) throw error;
        const actual = leerSesion();
        if (!actual || actual.usuario.id !== session.usuario.id) throw error;
        return enviar(actual.accessToken === session.accessToken ? await renovarSesion(session) : actual);
    }
}

export const api = {
    get: (path) => solicitar(path),
    post: (path, data) => solicitar(path, { method: 'POST', data }),
    put: (path, data) => solicitar(path, { method: 'PUT', data }),
    delete: (path) => solicitar(path, { method: 'DELETE' }),
};
