import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Routes, Route } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import { renderWithProviders } from '../../test/renderWithProviders'
import { initDB, login, getSession } from '../../services/db'

// Layout con una vista hija y la pantalla de inicio a la que se vuelve al cerrar sesión
const renderLayout = () =>
    renderWithProviders(
        <Routes>
            <Route path="/" element={<h1>Inicio de la tienda</h1>} />
            <Route element={<AdminLayout />}>
                <Route path="/admin" element={<h1>Contenido del panel</h1>} />
            </Route>
        </Routes>,
        { ruta: '/admin' }
    )

describe('AdminLayout', () => {
    beforeEach(() => initDB())

    // Render: menú con sus enlaces, usuario en sesión y la vista hija
    it('muestra el menú del administrador con todos los accesos y la vista hija', () => {
        login('admin@duoc.cl', 'admin123')
        renderLayout()

        const menu = screen.getByRole('navigation', { name: 'Menú de administración' })
        expect(menu).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/admin')
        expect(screen.getByRole('link', { name: 'Productos' })).toHaveAttribute('href', '/admin/productos')
        expect(screen.getByRole('link', { name: 'Usuarios' })).toHaveAttribute('href', '/admin/usuarios')
        expect(screen.getByRole('link', { name: 'Volver a la tienda' })).toHaveAttribute('href', '/')
        expect(screen.getByText('Paulo (administrador)')).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Contenido del panel' })).toBeInTheDocument()
    })

    // Render condicional por rol: el vendedor no ve Usuarios
    it('el vendedor no ve el acceso a Usuarios', () => {
        login('vendedor@duoc.cl', 'vende123')
        renderLayout()

        expect(screen.getByRole('link', { name: 'Productos' })).toBeInTheDocument()
        expect(screen.queryByRole('link', { name: 'Usuarios' })).not.toBeInTheDocument()
    })

    // Estado de ruta: la sección actual queda resaltada
    it('marca con la clase active el enlace de la sección actual', () => {
        login('admin@duoc.cl', 'admin123')
        renderLayout()

        expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveClass('active')
        expect(screen.getByRole('link', { name: 'Productos' })).not.toHaveClass('active')
    })

    // Evento: cerrar sesión borra la sesión y lleva a la tienda
    it('Cerrar sesión borra la sesión y vuelve al inicio', async () => {
        login('admin@duoc.cl', 'admin123')
        renderLayout()

        await userEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }))

        expect(getSession()).toBeNull()
        expect(screen.getByRole('heading', { name: 'Inicio de la tienda' })).toBeInTheDocument()
    })
})
