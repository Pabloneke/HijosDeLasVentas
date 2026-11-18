const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1').replace(/\/$/, '');

export async function api(path, { method = 'GET', data, token, headers = {} } = {}) {
    let response;
    try {
        response = await fetch(baseUrl + path, {
            method,
            credentials: 'include',
            headers: {
                Accept: 'application/json',
                ...(data && { 'Content-Type': 'application/json' }),
                ...(token && { Authorization: 'Bearer ' + token }),
                ...headers,
            },
            ...(data && { body: JSON.stringify(data) }),
        });
    } catch {
        throw new Error('No se pudo conectar con el servidor.');
    }

    if (!response.ok) {
        const mensajes = {
            400: 'Revisa los datos ingresados.',
            401: 'Tu sesión ya no es válida.',
            403: 'No tienes permiso para realizar esta operación.',
            409: 'El correo o RUN ya está registrado.',
        };
        const message = path === '/auth/login' && response.status === 401
            ? 'Correo o contraseña incorrectos'
            : mensajes[response.status] || 'El servidor no pudo completar la solicitud.';
        throw Object.assign(new Error(message), { status: response.status });
    }

    return response.json();
}
