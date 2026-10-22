import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Navbar from './Navbar'

// Navbar usa Link y useLocation, que solo funcionan dentro de un Router.
// MemoryRouter simula la navegación en memoria; initialEntries fija la ruta actual.
const renderNavbar = (ruta = '/') =>
    render(
        <MemoryRouter initialEntries={[ruta]}>
            <Navbar />
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
})
