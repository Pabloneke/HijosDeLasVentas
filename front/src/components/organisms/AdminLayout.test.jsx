import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Routes, Route } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import { renderWithProviders } from '../../test/renderWithProviders'
import { iniciarSesion, getSession } from '../../test/authFixtures'

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
    // Render: menú con sus enlaces, usuario en sesión y la vista hija
    it('muestra el menú del administrador con todos los accesos y la vista hija', () => {
        iniciarSesion('admin@duoc.cl')
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
        iniciarSesion('vendedor@duoc.cl')
        renderLayout()

        expect(screen.getByRole('link', { name: 'Productos' })).toBeInTheDocument()
        expect(screen.queryByRole('link', { name: 'Usuarios' })).not.toBeInTheDocument()
    })

    // Estado de ruta: la sección actual queda resaltada
    it('marca con la clase active el enlace de la sección actual', () => {
        iniciarSesion('admin@duoc.cl')
        renderLayout()

        expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveClass('active')
        expect(screen.getByRole('link', { name: 'Productos' })).not.toHaveClass('active')
    })

    // Evento: cerrar sesión borra la sesión y lleva a la tienda
    it('Cerrar sesión borra la sesión y vuelve al inicio', async () => {
        iniciarSesion('admin@duoc.cl')
        renderLayout()

        await userEvent.click(screen.getByRole('button', { name: 'Cerrar sesión' }))

        expect(getSession()).toBeNull()
        expect(screen.getByRole('heading', { name: 'Inicio de la tienda' })).toBeInTheDocument()
    })
})
