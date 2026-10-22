import {
    initDB, getProducts, isStockCritico, getOrders, createOrder,
    getUsers, getUserById, findUserByEmail, createUser, updateUser, deleteUser,
    getSession, login, logout,
} from './db'

// jsdom ya trae un localStorage simulado, y setup.js lo limpia después de cada prueba.
// Así cada prueba parte con el almacenamiento vacío y no depende de las demás.
describe('db (localStorage)', () => {
    // Aislamiento de localStorage: initDB siembra una vez y no pisa datos existentes
    it('initDB siembra productos y usuarios solo si no existen y no sobrescribe los actuales', () => {
        initDB()
        expect(getProducts()).toHaveLength(6)
        expect(getUsers()).toHaveLength(3)

        deleteUser(3)
        initDB()
        expect(getUsers()).toHaveLength(2)
    })
})

describe('db — CRUD de usuarios', () => {
    beforeEach(() => initDB())

    // Leer: se siembran los 3 roles del sistema
    it('initDB siembra usuarios con los roles administrador, vendedor y cliente', () => {
        expect(getUsers().map((u) => u.tipo)).toEqual(['administrador', 'vendedor', 'cliente'])
        expect(getUserById(1).correo).toBe('admin@duoc.cl')
    })

    // Leer: la búsqueda por correo ignora mayúsculas y espacios
    it('findUserByEmail ignora mayúsculas y espacios, y devuelve null si no existe', () => {
        expect(findUserByEmail('  ADMIN@duoc.cl ').id).toBe(1)
        expect(findUserByEmail('nadie@duoc.cl')).toBeNull()
    })

    // Crear: usuario nuevo es cliente por defecto y no se permite repetir correo
    it('createUser crea un cliente por defecto y rechaza un correo repetido', () => {
        const nuevo = createUser({ nombre: 'Ana', correo: 'ana@gmail.com', password: 'abc123' })

        expect(nuevo.id).toBe(4)
        expect(nuevo.tipo).toBe('cliente')
        expect(() => createUser({ nombre: 'Otra', correo: 'ANA@gmail.com', password: 'x' })).toThrow('El correo ya está registrado')
        expect(getUsers()).toHaveLength(4)
    })

    // Actualizar: se puede cambiar el rol, pero no tomar el correo de otro usuario
    it('updateUser cambia datos, rechaza correos de otros usuarios y devuelve null si no existe', () => {
        expect(updateUser(3, { tipo: 'vendedor' }).tipo).toBe('vendedor')
        expect(updateUser(3, { correo: 'carla@gmail.com' }).id).toBe(3) // su propio correo sí vale
        expect(() => updateUser(3, { correo: 'admin@duoc.cl' })).toThrow('El correo ya está registrado')
        expect(updateUser(999, { nombre: 'X' })).toBeNull()
    })

    // Eliminar
    it('deleteUser elimina al usuario y devuelve false si no existe', () => {
        expect(deleteUser(3)).toBe(true)
        expect(getUserById(3)).toBeNull()
        expect(deleteUser(3)).toBe(false)
    })
})

describe('db — sesión', () => {
    beforeEach(() => initDB())

    // Login correcto guarda la sesión sin la contraseña
    it('login con credenciales válidas guarda la sesión sin incluir la contraseña', () => {
        const sesion = login('ADMIN@duoc.cl', 'admin123')

        expect(sesion).toEqual({ id: 1, nombre: 'Paulo', correo: 'admin@duoc.cl', tipo: 'administrador' })
        expect(getSession()).toEqual(sesion)
        expect(JSON.stringify(getSession())).not.toContain('admin123')
    })

    // Credenciales incorrectas lanzan error y no crean sesión
    it('login lanza error con contraseña incorrecta o correo inexistente y no crea sesión', () => {
        expect(() => login('admin@duoc.cl', 'mala')).toThrow('Correo o contraseña incorrectos')
        expect(() => login('nadie@duoc.cl', 'admin123')).toThrow('Correo o contraseña incorrectos')
        expect(getSession()).toBeNull()
    })

    // Logout borra la sesión; una sesión dañada se trata como "sin sesión"
    it('logout elimina la sesión y getSession devuelve null con datos dañados', () => {
        login('admin@duoc.cl', 'admin123')
        logout()
        expect(getSession()).toBeNull()

        localStorage.setItem('sesion', '{dañado')
        expect(getSession()).toBeNull()
    })
})

describe('db — stock crítico', () => {
    beforeEach(() => initDB())

    // RF5: el umbral es inclusivo (stock igual al crítico ya cuenta como crítico)
    it('isStockCritico es verdadero cuando el stock es menor o igual al umbral', () => {
        expect(isStockCritico({ stock: 2, stockCritico: 3 })).toBe(true)
        expect(isStockCritico({ stock: 3, stockCritico: 3 })).toBe(true)
        expect(isStockCritico({ stock: 4, stockCritico: 3 })).toBe(false)
    })

    // Los datos base dejan exactamente dos productos en crítico para poder probar el panel
    it('los productos base incluyen algunos en stock crítico y otros no', () => {
        const criticos = getProducts().filter(isStockCritico).map((p) => p.name)
        expect(criticos).toEqual(['Teclado Mecánico RGB', 'Manga Dorohedoro Vol. 1'])
    })
})

describe('db — órdenes', () => {
    // Leer: sin compras la lista está vacía
    it('getOrders devuelve [] cuando no hay órdenes', () => {
        expect(getOrders()).toEqual([])
    })

    // Crear: asigna id consecutivo y fecha, y la deja guardada
    it('createOrder asigna id consecutivo y fecha, y la deja guardada', () => {
        const primera = createOrder({ cliente: { userId: 3 }, total: 1000 })
        const segunda = createOrder({ cliente: { userId: null }, total: 2000 })

        expect(primera.id).toBe(1)
        expect(segunda.id).toBe(2)
        expect(Number.isNaN(Date.parse(primera.fecha))).toBe(false)
        expect(getOrders()).toHaveLength(2)
    })
})
