import {
    initDB, getProducts,
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
