import { screen, waitFor, within } from '@testing-library/react'
import AdminDashboard from './AdminDashboard'
import { renderWithProviders } from '../../test/renderWithProviders'
import { initDB, login } from '../../services/db'
import { api } from '../../services/api'
import { formatPrice } from '../../utils/precios'

vi.mock('../../services/api', async (importOriginal) => ({
    ...(await importOriginal()),
    api: { get: vi.fn() },
}))

const cat = { id: 1, nombre: 'Computación' }

// Mismo catálogo de siempre: Teclado (4 <= 5) y Manga (2 <= 2) están en stock crítico
const productosApi = [
    { id: 1, name: 'Perfume Rasasi Hawas', stock: 12, stockCritico: 3, category: cat },
    { id: 2, name: 'MousePad XXL Gamer', stock: 25, stockCritico: 5, category: cat },
    { id: 3, name: 'Teclado Mecánico RGB', stock: 4, stockCritico: 5, category: cat },
    { id: 4, name: 'Juego PS4', stock: 8, stockCritico: 3, category: cat },
    { id: 5, name: 'GTA VI (Pre-venta)', stock: 50, stockCritico: 10, category: cat },
    { id: 6, name: 'Manga Dorohedoro Vol. 1', stock: 2, stockCritico: 2, category: cat },
]

const carla = { id: 3, nombre: 'Carla', apellidos: 'Gómez', correo: 'carla@gmail.com' }

// Boleta como la devuelve GET /boletas; usuario null = compra sin sesión
const boleta = (id, usuario, total, fecha) => ({
    id, fecha, total, usuario, clienteNombre: 'X', clienteCorreo: 'x@duoc.cl', items: [],
})

// "Backend" por ruta
const responder = ({ productos = productosApi, boletas = [] } = {}) => {
    api.get.mockImplementation(async (ruta) => ({
        '/productos': productos,
        '/boletas': boletas,
        '/usuarios': [{ id: 1 }, { id: 2 }, { id: 3 }],
    })[ruta])
}

// Espera a que la API haya respondido (la tarjeta de productos deja de estar en 0)
const productosActivos = (n) => waitFor(() =>
    expect(screen.getByText('Productos activos').nextElementSibling).toHaveTextContent(String(n)))

describe('AdminDashboard', () => {
    beforeEach(() => {
        initDB() // solo para la sesión: los datos ya vienen de la API
        login('admin@duoc.cl', 'admin123')
        responder()
    })

    // Prueba de render: saludo y tarjetas de resumen con los datos de la API
    it('saluda al usuario y muestra los conteos de productos, usuarios, stock crítico y compras', async () => {
        renderWithProviders(<AdminDashboard />)
        await productosActivos(6)

        expect(screen.getByRole('heading', { name: '¡Hola, Paulo!' })).toBeInTheDocument()
        expect(screen.getByText('Usuarios registrados').nextElementSibling).toHaveTextContent('3')
        expect(screen.getByText('Con stock crítico').nextElementSibling).toHaveTextContent('2')
        expect(screen.getByText('Compras realizadas').nextElementSibling).toHaveTextContent('0')
    })

    // Lógica: solo aparecen los productos con stock <= stockCritico
    it('la tabla de stock crítico lista únicamente los productos en el umbral o bajo él', async () => {
        renderWithProviders(<AdminDashboard />)

        const tabla = within(await screen.findByRole('table', { name: 'Stock crítico' }))
        expect(tabla.getByText('Teclado Mecánico RGB')).toBeInTheDocument()
        expect(tabla.getByText('Manga Dorohedoro Vol. 1')).toBeInTheDocument()
        expect(tabla.queryByText('Perfume Rasasi Hawas')).not.toBeInTheDocument()
        expect(tabla.queryByText('GTA VI (Pre-venta)')).not.toBeInTheDocument()
    })

    // Render condicional: sin productos críticos se muestra el aviso en vez de la tabla
    it('muestra un aviso cuando ningún producto está en stock crítico', async () => {
        responder({ productos: [{ id: 1, name: 'Perfume', stock: 50, stockCritico: 3, category: cat }] })
        renderWithProviders(<AdminDashboard />)
        await productosActivos(1)

        expect(screen.getByText('Sin productos en stock crítico.')).toBeInTheDocument()
        expect(screen.queryByRole('table', { name: 'Stock crítico' })).not.toBeInTheDocument()
    })

    // Render condicional: sin órdenes aparece el estado vacío del historial
    it('muestra "Aún no hay compras registradas." cuando no hay órdenes', async () => {
        renderWithProviders(<AdminDashboard />)
        await productosActivos(6)

        expect(screen.getByText('Aún no hay compras registradas.')).toBeInTheDocument()
        expect(screen.queryByRole('table', { name: 'Historial de compras' })).not.toBeInTheDocument()
    })

    // Lógica: agrupa por usuario, suma lo gastado y junta las compras sin sesión como "Invitado"
    it('agrupa las compras por usuario con su total y muestra Invitado para las compras sin sesión', async () => {
        responder({
            boletas: [
                boleta(1, carla, 10000, '2026-10-01T12:00:00'),
                boleta(2, carla, 25000, '2026-10-05T12:00:00'),
                boleta(3, null, 8000, '2026-10-03T12:00:00'),
            ],
        })

        renderWithProviders(<AdminDashboard />)

        const tabla = within(await screen.findByRole('table', { name: 'Historial de compras' }))
        const filas = tabla.getAllByRole('row').slice(1) // sin el encabezado

        expect(filas).toHaveLength(2)
        // La más reciente primero: Carla (última compra el 5 de octubre); su nombre sale de la boleta
        expect(within(filas[0]).getByText('Carla Gómez')).toBeInTheDocument()
        expect(within(filas[0]).getByText('carla@gmail.com')).toBeInTheDocument()
        expect(within(filas[0]).getByText('2')).toBeInTheDocument()
        expect(within(filas[0]).getByText(formatPrice(35000))).toBeInTheDocument()
        expect(within(filas[1]).getByText('Invitado')).toBeInTheDocument()
        expect(within(filas[1]).getByText(formatPrice(8000))).toBeInTheDocument()
    })

    // Permisos en pantalla: el administrador ve Usuarios
    it('el administrador ve el acceso rápido y la tarjeta de Usuarios', async () => {
        renderWithProviders(<AdminDashboard />)
        await productosActivos(6)

        expect(screen.getByRole('link', { name: 'Ver usuarios' })).toHaveAttribute('href', '/admin/usuarios')
        expect(api.get).toHaveBeenCalledWith('/usuarios')
    })

    // Permisos en pantalla: el vendedor no ve Usuarios y ni siquiera se pide /usuarios (daría 403)
    it('el vendedor no ve Usuarios ni consulta GET /usuarios', async () => {
        login('vendedor@duoc.cl', 'vende123')
        renderWithProviders(<AdminDashboard />)
        await productosActivos(6)

        expect(screen.queryByRole('link', { name: 'Ver usuarios' })).not.toBeInTheDocument()
        expect(screen.queryByText('Usuarios registrados')).not.toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'Ver productos' })).toBeInTheDocument()
        expect(api.get).not.toHaveBeenCalledWith('/usuarios')
    })
})
