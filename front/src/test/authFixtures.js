import { vi } from 'vitest';
import { findUserByEmail } from '../services/db';

const key = 'hijosdelasventas.auth';
const payload = (usuario) => ({ accessToken: 'jwt-de-prueba', expiresIn: 3600, usuario });

export const getSession = () => JSON.parse(localStorage.getItem(key))?.usuario ?? null;

export function iniciarSesion(correo) {
    const { password: _password, ...usuario } = findUserByEmail(correo);
    localStorage.setItem(key, JSON.stringify({ ...payload(usuario), expiresAt: Date.now() + 3600000 }));
}

export function mockAuthApi() {
    const respuesta = (data, status = 200) => ({ ok: status < 400, status, json: async () => data });
    return vi.spyOn(globalThis, 'fetch').mockImplementation(async (url, options) => {
        const datos = JSON.parse(options.body);
        const existente = findUserByEmail(datos.correo);
        if (url.endsWith('/auth/login')) {
            if (!existente || existente.password !== datos.password) return respuesta(null, 401);
            const { password: _password, ...usuario } = existente;
            return respuesta(payload(usuario));
        }
        if (url.endsWith('/auth/registro')) {
            if (existente) return respuesta(null, 409);
            return respuesta(payload({
                id: 10, nombre: datos.nombre, apellidos: datos.apellidos, correo: datos.correo, tipo: 'cliente',
            }), 201);
        }
        throw new Error('Solicitud inesperada: ' + url);
    });
}
