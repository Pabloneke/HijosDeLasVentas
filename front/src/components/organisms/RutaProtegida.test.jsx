import { screen } from '@testing-library/react'
import { Routes, Route } from 'react-router-dom'
import RutaProtegida from './RutaProtegida'
import { renderWithProviders } from '../../test/renderWithProviders'
import { initDB, login } from '../../services/db'

// Monta una ruta /admin protegida y las pantallas a las que se puede ser redirigido
const renderAdmin = () =>
    renderWithProviders(
        <Routes>
            <Route path="/" element={<h1>Inicio</h1>} />
            <Route path="/login" element={<h1>Pantalla de login</h1>} />
            <Route element={<RutaProtegida roles={['administrador', 'vendedor']} />}>
                <Route path="/admin" element={<h1>Panel</h1>} />
            </Route>
        </Routes>,
        { ruta: '/admin' }
    )

describe('RutaProtegida', () => {
    beforeEach(() => initDB())

    // Redirección: sin sesión no se puede ver el panel
    it('sin sesión redirige al login', () => {
        renderAdmin()

        expect(screen.getByRole('heading', { name: 'Pantalla de login' })).toBeInTheDocument()
        expect(screen.queryByRole('heading', { name: 'Panel' })).not.toBeInTheDocument()
    })

    // Render condicional por rol: un cliente es devuelto al inicio
    it('un cliente es redirigido al inicio', () => {
        login('carla@gmail.com', 'cliente123')
        renderAdmin()

        expect(screen.getByRole('heading', { name: 'Inicio' })).toBeInTheDocument()
        expect(screen.queryByRole('heading', { name: 'Panel' })).not.toBeInTheDocument()
    })

    // Administrador y vendedor sí entran
    it.each([
        ['administrador', 'admin@duoc.cl', 'admin123'],
        ['vendedor', 'vendedor@duoc.cl', 'vende123'],
    ])('el %s puede ver el panel', (_rol, correo, password) => {
        login(correo, password)
        renderAdmin()

        expect(screen.getByRole('heading', { name: 'Panel' })).toBeInTheDocument()
    })
})
