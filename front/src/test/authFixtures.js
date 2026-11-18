import { vi } from 'vitest';

// Usuarios de prueba (los mismos 3 que siembra data.sql en el backend).
// La contraseña solo sirve para simular el login en mockAuthApi.
const USUARIOS = [
    { id: 1, run: '190110222', nombre: 'Paulo', apellidos: 'Catalán', correo: 'admin@duoc.cl', password: 'admin123', tipo: 'administrador', direccion: 'Av. Siempre Viva 123', region: 'Región Metropolitana de Santiago', comuna: 'Santiago' },
    { id: 2, run: '182345679', nombre: 'Mauricio', apellidos: 'Ahumada', correo: 'vendedor@duoc.cl', password: 'vende123', tipo: 'vendedor', direccion: 'Calle Los Alerces 456', region: 'Región del Biobío', comuna: 'Concepción' },
    { id: 3, run: '20987654K', nombre: 'Carla', apellidos: 'Gómez', correo: 'carla@gmail.com', password: 'cliente123', tipo: 'cliente', direccion: 'Pasaje Las Rosas 789', region: 'Región de Valparaíso', comuna: 'Viña del Mar' },
];
const findUserByEmail = (correo) => USUARIOS.find((u) => u.correo.toLowerCase() === String(correo).trim().toLowerCase());

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
