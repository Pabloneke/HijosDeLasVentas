import { screen, within } from '@testing-library/react'
import AdminDashboard from './AdminDashboard'
import { renderWithProviders } from '../../test/renderWithProviders'
import { initDB, login, createOrder } from '../../services/db'
import { formatPrice } from '../../utils/precios'

// Compra de ejemplo; userId null representa una compra sin sesión iniciada
const compra = (userId, total, fecha) => {
    const orden = createOrder({ cliente: { userId, nombre: 'X', correo: 'x@duoc.cl' }, items: [], total })
    // createOrder fija la fecha actual: la reemplazamos para controlar cuál es la más reciente
    const ordenes = JSON.parse(localStorage.getItem('ordenes')).map((o) => (o.id === orden.id ? { ...o, fecha } : o))
    localStorage.setItem('ordenes', JSON.stringify(ordenes))
}

describe('AdminDashboard', () => {
    beforeEach(() => {
        initDB()
        login('admin@duoc.cl', 'admin123')
    })

    // Prueba de render: saludo y tarjetas de resumen con los datos sembrados
    it('saluda al usuario y muestra los conteos de productos, usuarios, stock crítico y compras', () => {
        renderWithProviders(<AdminDashboard />)

        expect(screen.getByRole('heading', { name: '¡Hola, Paulo!' })).toBeInTheDocument()
        expect(screen.getByText('Productos activos').nextElementSibling).toHaveTextContent('6')
        expect(screen.getByText('Usuarios registrados').nextElementSibling).toHaveTextContent('3')
        expect(screen.getByText('Con stock crítico').nextElementSibling).toHaveTextContent('2')
        expect(screen.getByText('Compras realizadas').nextElementSibling).toHaveTextContent('0')
    })

    // Lógica: solo aparecen los productos con stock <= stockCritico (Teclado 4<=5 y Manga 2<=2)
    it('la tabla de stock crítico lista únicamente los productos en el umbral o bajo él', () => {
        renderWithProviders(<AdminDashboard />)

        const tabla = within(screen.getByRole('table', { name: 'Stock crítico' }))
        expect(tabla.getByText('Teclado Mecánico RGB')).toBeInTheDocument()
        expect(tabla.getByText('Manga Dorohedoro Vol. 1')).toBeInTheDocument()
        expect(tabla.queryByText('Perfume Rasasi Hawas')).not.toBeInTheDocument()
        expect(tabla.queryByText('GTA VI (Pre-venta)')).not.toBeInTheDocument()
    })

    // Render condicional: sin productos críticos se muestra el aviso en vez de la tabla
    it('muestra un aviso cuando ningún producto está en stock crítico', () => {
        localStorage.setItem('productos', JSON.stringify([
            { id: 1, name: 'Perfume', price: 1000, category: 'Perfumería', stock: 50, stockCritico: 3 },
        ]))
        renderWithProviders(<AdminDashboard />)

        expect(screen.getByText('Sin productos en stock crítico.')).toBeInTheDocument()
        expect(screen.queryByRole('table', { name: 'Stock crítico' })).not.toBeInTheDocument()
    })

    // Render condicional: sin órdenes aparece el estado vacío del historial
    it('muestra "Aún no hay compras registradas." cuando no hay órdenes', () => {
        renderWithProviders(<AdminDashboard />)

        expect(screen.getByText('Aún no hay compras registradas.')).toBeInTheDocument()
        expect(screen.queryByRole('table', { name: 'Historial de compras' })).not.toBeInTheDocument()
    })

    // Lógica: agrupa por usuario, suma lo gastado y junta las compras sin sesión como "Invitado"
    it('agrupa las compras por usuario con su total y muestra Invitado para las compras sin sesión', () => {
        compra(3, 10000, '2026-10-01T12:00:00.000Z')
        compra(3, 25000, '2026-10-05T12:00:00.000Z')
        compra(null, 8000, '2026-10-03T12:00:00.000Z')

        renderWithProviders(<AdminDashboard />)

        const tabla = within(screen.getByRole('table', { name: 'Historial de compras' }))
        const filas = tabla.getAllByRole('row').slice(1) // sin el encabezado

        expect(filas).toHaveLength(2)
        // La más reciente primero: Carla (última compra el 5 de octubre)
        expect(within(filas[0]).getByText('Carla Gómez')).toBeInTheDocument()
        expect(within(filas[0]).getByText('carla@gmail.com')).toBeInTheDocument()
        expect(within(filas[0]).getByText('2')).toBeInTheDocument()
        expect(within(filas[0]).getByText(formatPrice(35000))).toBeInTheDocument()
        expect(within(filas[1]).getByText('Invitado')).toBeInTheDocument()
        expect(within(filas[1]).getByText(formatPrice(8000))).toBeInTheDocument()
    })

    // Permisos en pantalla: el vendedor no ve el acceso rápido a Usuarios
    it('el vendedor no ve el acceso rápido a Usuarios, el administrador sí', () => {
        const { unmount } = renderWithProviders(<AdminDashboard />)
        expect(screen.getByRole('link', { name: 'Ver usuarios' })).toHaveAttribute('href', '/admin/usuarios')
        unmount()

        login('vendedor@duoc.cl', 'vende123')
        renderWithProviders(<AdminDashboard />)
        expect(screen.queryByRole('link', { name: 'Ver usuarios' })).not.toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'Ver productos' })).toBeInTheDocument()
    })
})
