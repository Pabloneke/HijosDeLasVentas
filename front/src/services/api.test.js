import { api } from './api'
import { guardarSesion, leerSesion } from './sesion'

const iniciar = (accessToken) => guardarSesion({ accessToken, usuario: { id: 1 }, expiresIn: 3600 })

const respuesta = (status, cuerpo) => ({ status, ok: status < 300, json: vi.fn().mockResolvedValue(cuerpo) })

describe('api', () => {
    beforeEach(() => vi.stubGlobal('fetch', vi.fn()))
    afterEach(() => vi.unstubAllGlobals())

    it('envía el token como Bearer y el cuerpo como JSON', async () => {
        iniciar('abc.def')
        fetch.mockResolvedValue(respuesta(201, { id: 1 }))

        expect(await api.post('/productos', { name: 'Mouse' })).toEqual({ id: 1 })

        const [url, { method, headers, body }] = fetch.mock.calls[0]
        expect(url).toBe('http://localhost:8080/api/v1/productos')
        expect(method).toBe('POST')
        expect(headers).toMatchObject({ 'Content-Type': 'application/json', Authorization: 'Bearer abc.def' })
        expect(JSON.parse(body)).toEqual({ name: 'Mouse' })
    })

    it('lanza un Error con el mensaje del backend y el status', async () => {
        fetch.mockResolvedValue(respuesta(400, { message: 'Stock insuficiente' }))

        await expect(api.post('/boletas', {})).rejects.toMatchObject({ message: 'Stock insuficiente', status: 400 })
    })

    it('renueva ante un 401 y reintenta con el token nuevo', async () => {
        iniciar('vencido')
        fetch.mockResolvedValueOnce(respuesta(401, {}))
            .mockResolvedValueOnce(respuesta(200, { accessToken: 'nuevo', usuario: { id: 1 }, expiresIn: 3600 }))
            .mockResolvedValueOnce(respuesta(200, []))

        await expect(api.get('/boletas')).resolves.toEqual([])
        expect(fetch.mock.calls[1]).toEqual([expect.stringMatching(/auth\/refresh$/), expect.objectContaining({
            credentials: 'include', headers: expect.objectContaining({ 'X-Refresh-Token': '1' }),
        })])
        expect(fetch.mock.calls[2][1].headers.Authorization).toBe('Bearer nuevo')
        expect(leerSesion().accessToken).toBe('nuevo')
    })

    it('cierra la sesión si falla la renovación', async () => {
        iniciar('vencido')
        fetch.mockResolvedValue(respuesta(401, {}))
        await expect(api.get('/boletas')).rejects.toMatchObject({ status: 401 })
        expect(leerSesion()).toBeNull()
    })

    it('un 401 en /auth/login (credenciales malas) no cierra la sesión', async () => {
        iniciar('vigente')
        fetch.mockResolvedValue(respuesta(401, { message: 'Credenciales inválidas' }))

        await expect(api.post('/auth/login', {})).rejects.toThrow('Correo o contraseña incorrectos')

        expect(leerSesion().accessToken).toBe('vigente')
    })

    it('un 204 (DELETE) devuelve null sin leer el cuerpo', async () => {
        const sinContenido = respuesta(204)
        fetch.mockResolvedValue(sinContenido)

        expect(await api.delete('/productos/1')).toBeNull()
        expect(sinContenido.json).not.toHaveBeenCalled()
    })
})
