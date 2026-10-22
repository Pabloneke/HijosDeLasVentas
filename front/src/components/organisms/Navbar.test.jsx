import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Navbar from './Navbar'
import { AuthProvider } from '../../context/AuthContext'
import { initDB, login, getSession } from '../../services/db'

// Navbar usa Link y useLocation, que solo funcionan dentro de un Router.
// MemoryRouter simula la navegación en memoria; initialEntries fija la ruta actual.
// Además lee la sesión con useAuth, así que necesita el AuthProvider.
const renderNavbar = (ruta = '/') =>
    render(
        <MemoryRouter initialEntries={[ruta]}>
            <AuthProvider>
                <Navbar />
            </AuthProvider>
        </MemoryRouter>
    )

describe('Navbar', () => {
    // Prueba 8 (render): los 6 enlaces de navegación existen y apuntan a su ruta
    it('muestra los 6 enlaces de navegación con su ruta', () => {
        renderNavbar()

        const enlaces = {
            Inicio: '/',
            Productos: '/productos',
            Ofertas: '/ofertas',
            Nosotros: '/nosotros',
            Blog: '/blogs',
            Contacto: '/contacto',
        }

        Object.entries(enlaces).forEach(([texto, ruta]) => {
            expect(screen.getByRole('link', { name: texto })).toHaveAttribute('href', ruta)
        })
    })

    // Prueba 9 (estado de router): solo el enlace de la ruta actual tiene la clase "active"
    it('marca con la clase active únicamente el enlace de la ruta actual', () => {
        renderNavbar('/productos')

        expect(screen.getByRole('link', { name: 'Productos' })).toHaveClass('active')
        expect(screen.getByRole('link', { name: 'Inicio' })).not.toHaveClass('active')
        expect(screen.getByRole('link', { name: 'Contacto' })).not.toHaveClass('active')
    })

    describe('sesión', () => {
        beforeEach(() => initDB())

        // Render condicional: sin sesión se ofrecen entrar o registrarse
        it('sin sesión muestra Iniciar Sesion y Crear Cuenta con su ruta', () => {
            renderNavbar()

            expect(screen.getByRole('link', { name: 'Iniciar Sesion' })).toHaveAttribute('href', '/login')
            expect(screen.getByRole('link', { name: 'Crear Cuenta' })).toHaveAttribute('href', '/registro')
            expect(screen.queryByRole('button', { name: 'Cerrar Sesion' })).not.toBeInTheDocument()
        })

        // Con sesión de cliente: saludo y cerrar sesión, sin acceso al panel
        it('con sesión de cliente saluda, permite cerrar sesión y no muestra Panel Admin', async () => {
            login('carla@gmail.com', 'cliente123')
            renderNavbar()

            expect(screen.getByText('Hola, Carla')).toBeInTheDocument()
            expect(screen.queryByRole('link', { name: 'Panel Admin' })).not.toBeInTheDocument()

            await userEvent.click(screen.getByRole('button', { name: 'Cerrar Sesion' }))

            expect(getSession()).toBeNull()
            expect(screen.getByRole('link', { name: 'Iniciar Sesion' })).toBeInTheDocument()
        })

        // El administrador sí ve el acceso al panel
        it('con sesión de administrador muestra el enlace Panel Admin', () => {
            login('admin@duoc.cl', 'admin123')
            renderNavbar()

            expect(screen.getByRole('link', { name: 'Panel Admin' })).toHaveAttribute('href', '/admin')
        })
    })
})
