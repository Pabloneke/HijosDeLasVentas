import { api, TOKEN_KEY, EVENTO_SESION_EXPIRADA } from './api'

const respuesta = (status, cuerpo) => ({ status, ok: status < 300, json: vi.fn().mockResolvedValue(cuerpo) })

describe('api', () => {
    beforeEach(() => vi.stubGlobal('fetch', vi.fn()))
    afterEach(() => vi.unstubAllGlobals())

    it('envía el token como Bearer y el cuerpo como JSON', async () => {
        localStorage.setItem(TOKEN_KEY, 'abc.def')
        fetch.mockResolvedValue(respuesta(201, { id: 1 }))

        expect(await api.post('/productos', { name: 'Mouse' })).toEqual({ id: 1 })

        const [url, { method, headers, body }] = fetch.mock.calls[0]
        expect(url).toBe('http://localhost:8080/api/v1/productos')
        expect(method).toBe('POST')
        expect(headers).toEqual({ 'Content-Type': 'application/json', Authorization: 'Bearer abc.def' })
        expect(JSON.parse(body)).toEqual({ name: 'Mouse' })
    })

    it('lanza un Error con el mensaje del backend y el status', async () => {
        fetch.mockResolvedValue(respuesta(400, { message: 'Stock insuficiente' }))

        await expect(api.post('/boletas', {})).rejects.toMatchObject({ message: 'Stock insuficiente', status: 400 })
    })

    it('un 401 borra el token y avisa que la sesión expiró', async () => {
        localStorage.setItem(TOKEN_KEY, 'vencido')
        const alExpirar = vi.fn()
        window.addEventListener(EVENTO_SESION_EXPIRADA, alExpirar)
        fetch.mockResolvedValue(respuesta(401, {}))

        await expect(api.get('/boletas')).rejects.toMatchObject({ status: 401 })

        expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
        expect(alExpirar).toHaveBeenCalledTimes(1)
        window.removeEventListener(EVENTO_SESION_EXPIRADA, alExpirar)
    })

    it('un 401 en /auth/login (credenciales malas) no cierra la sesión', async () => {
        localStorage.setItem(TOKEN_KEY, 'vigente')
        fetch.mockResolvedValue(respuesta(401, { message: 'Credenciales inválidas' }))

        await expect(api.post('/auth/login', {})).rejects.toThrow('Credenciales inválidas')

        expect(localStorage.getItem(TOKEN_KEY)).toBe('vigente')
    })

    it('un 204 (DELETE) devuelve null sin leer el cuerpo', async () => {
        const sinContenido = respuesta(204)
        fetch.mockResolvedValue(sinContenido)

        expect(await api.delete('/productos/1')).toBeNull()
        expect(sinContenido.json).not.toHaveBeenCalled()
    })
})
