import {
    esEmailValido, esDominioPermitido, esNombreValido, esPasswordValida, esRunValido,
    validarLogin, validarRegistro, validarCheckout, validarProducto, validarUsuarioAdmin,
} from './validaciones'

// Datos de registro válidos que cada prueba modifica en un solo campo
const registroValido = {
    run: '123456785',
    nombre: 'María José',
    apellidos: 'Pérez Soto',
    correo: 'maria@duoc.cl',
    password: 'clave1',
    confirmar: 'clave1',
    region: 'Región del Biobío',
    comuna: 'Concepción',
    direccion: 'Calle Los Alerces 456',
}

describe('validaciones', () => {
    // Prueba 56 (RF3, correo): formato y dominios autorizados
    it('acepta correos con formato válido y solo de los dominios permitidos', () => {
        expect(esEmailValido('ana@duoc.cl')).toBe(true)
        expect(esEmailValido('ana@duoc')).toBe(false)
        expect(esEmailValido('ana duoc.cl')).toBe(false)

        expect(esDominioPermitido('ana@profesor.duoc.cl')).toBe(true)
        expect(esDominioPermitido('ANA@Gmail.com')).toBe(true)
        expect(esDominioPermitido('ana@hotmail.com')).toBe(false)
    })

    // Prueba 57 (RF3, nombre): solo letras y espacios, entre 3 y 100 caracteres
    it('acepta nombres con letras, tildes y ñ, y rechaza números o largos inválidos', () => {
        expect(esNombreValido('Ñuñoa Pérez')).toBe(true)
        expect(esNombreValido('Ana3')).toBe(false)
        expect(esNombreValido('Al')).toBe(false) // muy corto
        expect(esNombreValido('a'.repeat(101))).toBe(false) // muy largo
    })

    // Prueba 58 (RF3, contraseña): de 4 a 10 caracteres
    it('acepta contraseñas de 4 a 10 caracteres', () => {
        expect(esPasswordValida('abcd')).toBe(true)
        expect(esPasswordValida('abcdefghij')).toBe(true)
        expect(esPasswordValida('abc')).toBe(false)
        expect(esPasswordValida('abcdefghijk')).toBe(false)
    })

    // Prueba 59 (RF3, RUN): módulo 11 con dígito verificador numérico, K y 0
    it('valida el RUN con su dígito verificador (incluye K y 0)', () => {
        expect(esRunValido('123456785')).toBe(true) // dv numérico
        expect(esRunValido('20987654K')).toBe(true) // dv K
        expect(esRunValido('20987654k')).toBe(true) // acepta minúscula
        expect(esRunValido('123456784')).toBe(false) // dv incorrecto
    })

    // Prueba 60 (RF3, RUN): formatos inválidos
    it('rechaza RUN vacío, con puntos o guion, con letras o de largo inválido', () => {
        expect(esRunValido('')).toBe(false)
        expect(esRunValido(undefined)).toBe(false)
        expect(esRunValido('12.345.678-5')).toBe(false)
        expect(esRunValido('12345K785')).toBe(false)
        expect(esRunValido('123456')).toBe(false) // corto
        expect(esRunValido('1234567890')).toBe(false) // largo
    })

    // Prueba 61: el RUN con dígito verificador 0 (resto 11) también se acepta
    it('acepta un RUN cuyo dígito verificador calculado es 0', () => {
        expect(esRunValido('10000130')).toBe(true) // cuerpo 1000013, dv 0
        expect(esRunValido('10000131')).toBe(false)
    })

    // Prueba 62 (formulario de login): devuelve un mensaje por campo inválido
    it('validarLogin devuelve errores por campo y {} cuando todo es válido', () => {
        expect(validarLogin({ correo: 'ana@duoc.cl', password: 'clave1' })).toEqual({})
        expect(validarLogin({ correo: '', password: 'clave1' }).correo).toBe('Ingresa tu correo')
        expect(validarLogin({ correo: 'ana', password: 'clave1' }).correo).toMatch(/formato/)
        expect(validarLogin({ correo: 'ana@hotmail.com', password: 'clave1' }).correo).toMatch(/@duoc\.cl/)
        expect(validarLogin({ correo: 'ana@duoc.cl', password: '12' }).password).toMatch(/entre 4 y 10/)
    })

    // Prueba 63 (formulario de registro): datos válidos no generan errores
    it('validarRegistro devuelve {} con datos válidos', () => {
        expect(validarRegistro(registroValido)).toEqual({})
    })

    // Prueba 64 (formulario de registro): cada campo inválido produce su propio error
    it('validarRegistro marca exactamente los campos inválidos', () => {
        const errores = validarRegistro({
            ...registroValido,
            run: '111',
            nombre: 'X1',
            apellidos: '',
            confirmar: 'otra',
            region: '',
            comuna: '',
            direccion: '   ',
        })

        expect(Object.keys(errores).sort()).toEqual(
            ['apellidos', 'comuna', 'confirmar', 'direccion', 'nombre', 'region', 'run'].sort()
        )
        expect(errores.confirmar).toBe('Las contraseñas no coinciden')
    })

    // Prueba 65 (caso borde): dirección demasiado larga
    it('validarRegistro rechaza una dirección de más de 300 caracteres', () => {
        const errores = validarRegistro({ ...registroValido, direccion: 'x'.repeat(301) })

        expect(errores.direccion).toMatch(/300/)
    })

    // Prueba 90 (checkout): retiro en tienda no exige dirección
    it('validarCheckout con retiro en tienda solo exige nombre, correo y tarjeta', () => {
        const base = { nombre: 'Ana Pérez', correo: 'ana@duoc.cl', entrega: 'retiro', region: '', comuna: '', direccion: '', tarjeta: '4111111111111111' }

        expect(validarCheckout(base)).toEqual({})
        expect(Object.keys(validarCheckout({ ...base, nombre: '', correo: 'x', tarjeta: '123' })).sort()).toEqual(['correo', 'nombre', 'tarjeta'])
    })

    // Prueba 91 (checkout): despacho exige región, comuna y dirección
    it('validarCheckout con despacho exige región, comuna y dirección', () => {
        const base = { nombre: 'Ana Pérez', correo: 'ana@duoc.cl', entrega: 'despacho', region: '', comuna: '', direccion: ' ', tarjeta: '4111111111111111' }

        expect(Object.keys(validarCheckout(base)).sort()).toEqual(['comuna', 'direccion', 'region'])
        expect(validarCheckout({ ...base, region: 'R', comuna: 'C', direccion: 'Calle 1' })).toEqual({})
    })

    // Prueba 92 (checkout): la tarjeta acepta espacios pero debe tener 16 dígitos numéricos
    it('validarCheckout acepta la tarjeta con espacios y rechaza letras o largos distintos de 16', () => {
        const base = { nombre: 'Ana Pérez', correo: 'ana@duoc.cl', entrega: 'retiro', region: '', comuna: '', direccion: '' }

        expect(validarCheckout({ ...base, tarjeta: '4111 1111 1111 1111' })).toEqual({})
        expect(validarCheckout({ ...base, tarjeta: '4111 1111 1111 111A' }).tarjeta).toBeDefined()
        expect(validarCheckout({ ...base, tarjeta: '41111111111111111' }).tarjeta).toBeDefined()
    })
})

describe('validarProducto', () => {
    const productoValido = { name: 'Audífonos', price: '30000', stock: '20', stockCritico: '5', category: 'Gaming' }

    it('no devuelve errores con datos válidos, y el stock crítico es opcional', () => {
        expect(validarProducto(productoValido)).toEqual({})
        expect(validarProducto({ ...productoValido, stockCritico: '' })).toEqual({})
        expect(validarProducto({ ...productoValido, price: '0' })).toEqual({})
    })

    it('rechaza nombre vacío o muy largo, precio negativo o vacío, y stock no entero', () => {
        expect(validarProducto({ ...productoValido, name: '   ' })).toHaveProperty('name')
        expect(validarProducto({ ...productoValido, name: 'x'.repeat(101) })).toHaveProperty('name')
        expect(validarProducto({ ...productoValido, price: '-1' })).toHaveProperty('price')
        expect(validarProducto({ ...productoValido, price: '' })).toHaveProperty('price')
        expect(validarProducto({ ...productoValido, stock: '2.5' })).toHaveProperty('stock')
        expect(validarProducto({ ...productoValido, stock: '-3' })).toHaveProperty('stock')
        expect(validarProducto({ ...productoValido, stockCritico: 'abc' })).toHaveProperty('stockCritico')
        expect(validarProducto({ ...productoValido, category: '' })).toHaveProperty('category')
    })
})

describe('validarUsuarioAdmin', () => {
    const usuarioValido = {
        run: '123456785', nombre: 'María José', apellidos: 'Pérez Soto', correo: 'maria@duoc.cl',
        password: 'clave1', tipo: 'vendedor', region: 'Región del Biobío', comuna: 'Concepción', direccion: 'Calle 1',
    }

    it('no devuelve errores con datos válidos', () => {
        expect(validarUsuarioAdmin(usuarioValido)).toEqual({})
    })

    it('exige el tipo de usuario y no pide confirmar la contraseña', () => {
        expect(validarUsuarioAdmin({ ...usuarioValido, tipo: '' })).toHaveProperty('tipo')
        expect(validarUsuarioAdmin(usuarioValido)).not.toHaveProperty('confirmar')
    })

    it('al editar acepta la contraseña vacía, pero al crear no', () => {
        expect(validarUsuarioAdmin({ ...usuarioValido, password: '' }, { editando: true })).toEqual({})
        expect(validarUsuarioAdmin({ ...usuarioValido, password: '' })).toHaveProperty('password')
        expect(validarUsuarioAdmin({ ...usuarioValido, password: 'ab' }, { editando: true })).toHaveProperty('password')
    })
})
