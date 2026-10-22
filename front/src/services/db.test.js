import {
    initDB, getProducts, getProductById, createProduct, updateProduct, deleteProduct, isStockCritico, getOrders, createOrder,
    getUsers, getUserById, findUserByEmail, createUser, updateUser, deleteUser,
    getSession, login, logout, procesarCompra,
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

describe('db — procesarCompra (control de stock)', () => {
    beforeEach(() => initDB())
    const cliente = { userId: 3, nombre: 'Carla', correo: 'carla@gmail.com' }

    // Teclado (id 3) tiene stock 4; MousePad (id 2) tiene stock 25
    it('descuenta el stock y registra la orden cuando alcanza para todos los ítems', () => {
        const orden = procesarCompra([
            { id: 3, name: 'Teclado Mecánico RGB', price: 45000, quantity: 4 },
            { id: 2, name: 'MousePad XXL Gamer', price: 15000, quantity: 2 },
        ], cliente)

        expect(orden).toMatchObject({ id: 1, total: 45000 * 4 + 15000 * 2, cliente })
        expect(getProductById(3).stock).toBe(0)
        expect(getProductById(2).stock).toBe(23)
        expect(getOrders()).toHaveLength(1)
    })

    it('guarda la entrega en la orden cuando se informa', () => {
        const entrega = { modalidad: 'despacho', region: 'Región Metropolitana de Santiago', comuna: 'Santiago', direccion: 'Calle 1' }
        const orden = procesarCompra([{ id: 2, name: 'MousePad XXL Gamer', price: 15000, quantity: 1 }], cliente, entrega)

        expect(orden.entrega).toEqual(entrega)
        expect(getOrders()[0].entrega).toEqual(entrega)
    })

    it('rechaza una cantidad mayor al stock y no modifica nada (todo o nada)', () => {
        expect(() => procesarCompra([
            { id: 2, name: 'MousePad XXL Gamer', price: 15000, quantity: 2 },
            { id: 3, name: 'Teclado Mecánico RGB', price: 45000, quantity: 999 },
        ], cliente)).toThrow(/Teclado Mecánico RGB: solo quedan 4 unidades/)

        expect(getProductById(2).stock).toBe(25)
        expect(getProductById(3).stock).toBe(4)
        expect(getOrders()).toEqual([])
    })

    it('rechaza productos agotados o que ya no existen', () => {
        updateProduct(4, { stock: 0 })

        expect(() => procesarCompra([{ id: 4, name: 'Juego PS4', price: 20000, quantity: 1 }], cliente)).toThrow(/agotado/)
        expect(() => procesarCompra([{ id: 999, name: 'Fantasma', price: 1, quantity: 1 }], cliente)).toThrow(/ya no está disponible/)
        expect(getOrders()).toEqual([])
    })
})

describe('db — CRUD de productos', () => {
    beforeEach(() => initDB())

    // Leer: un producto por id, o null si no existe
    it('getProductById devuelve el producto pedido o null si no existe', () => {
        expect(getProductById(4).name).toBe('Juego PS4')
        expect(getProductById('4').name).toBe('Juego PS4') // el id puede llegar como texto
        expect(getProductById(999)).toBeNull()
    })

    // Crear: siguiente id, valores por defecto y persistencia
    it('createProduct asigna el siguiente id, completa valores por defecto y persiste', () => {
        const nuevo = createProduct({ name: 'Audífonos', price: 30000, category: 'Gaming' })

        expect(nuevo).toMatchObject({ id: 7, stock: 0, stockCritico: 0, image: '/img/logo.png' })
        expect(getProducts()).toHaveLength(7)
    })

    // Actualizar: solo cambian los campos recibidos y el id no se puede pisar
    it('updateProduct modifica solo los campos recibidos y devuelve null si no existe', () => {
        const actualizado = updateProduct(4, { stock: 1, id: 999 })

        expect(actualizado).toMatchObject({ id: 4, name: 'Juego PS4', stock: 1 })
        expect(getProductById(4).stock).toBe(1)
        expect(updateProduct(999, { stock: 1 })).toBeNull()
    })

    // Eliminar
    it('deleteProduct elimina el producto y devuelve false si no existe', () => {
        expect(deleteProduct(4)).toBe(true)
        expect(getProductById(4)).toBeNull()
        expect(getProducts()).toHaveLength(5)
        expect(deleteProduct(4)).toBe(false)
    })
})
