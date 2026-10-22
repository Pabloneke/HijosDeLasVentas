import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Routes, Route } from 'react-router-dom'
import Login from './Login'
import { renderWithProviders } from '../test/renderWithProviders'
import { initDB, getSession } from '../services/db'

// Rutas mínimas para comprobar a dónde navega el login según el rol
const renderLogin = () =>
    renderWithProviders(
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<p>Página de inicio</p>} />
            <Route path="/admin" element={<p>Página de administración</p>} />
        </Routes>,
        { ruta: '/login' }
    )

const llenar = async (correo, password) => {
    await userEvent.type(screen.getByLabelText('Correo electrónico'), correo)
    await userEvent.type(screen.getByLabelText('Contraseña'), password)
    await userEvent.click(screen.getByRole('button', { name: 'Ingresar' }))
}

describe('Login', () => {
    beforeEach(() => initDB())

    // Prueba 69 (validación): enviar vacío muestra errores y no inicia sesión
    it('muestra errores de validación si se envía el formulario vacío', async () => {
        renderLogin()

        await userEvent.click(screen.getByRole('button', { name: 'Ingresar' }))

        expect(screen.getByText('Ingresa tu correo')).toBeInTheDocument()
        expect(screen.getByText('La contraseña debe tener entre 4 y 10 caracteres')).toBeInTheDocument()
        expect(getSession()).toBeNull()
    })

    // Prueba 70 (error de credenciales): formato válido pero contraseña equivocada
    it('muestra un error general si las credenciales no coinciden', async () => {
        renderLogin()

        await llenar('admin@duoc.cl', 'equivocada')

        expect(screen.getByRole('alert')).toHaveTextContent('Correo o contraseña incorrectos')
        expect(getSession()).toBeNull()
    })

    // Prueba 71 (navegación por rol): el administrador va al panel
    it('un administrador inicia sesión y es llevado al panel de administración', async () => {
        renderLogin()

        await llenar('admin@duoc.cl', 'admin123')

        expect(screen.getByText('Página de administración')).toBeInTheDocument()
        expect(getSession().tipo).toBe('administrador')
    })

    // Prueba 72 (navegación por rol): el cliente va al inicio
    it('un cliente inicia sesión y es llevado a la página de inicio', async () => {
        renderLogin()

        await llenar('carla@gmail.com', 'cliente123')

        expect(screen.getByText('Página de inicio')).toBeInTheDocument()
    })

    // Prueba 73 (render): existe el enlace para crear cuenta
    it('ofrece un enlace a la página de registro', () => {
        renderLogin()

        expect(screen.getByRole('link', { name: 'Crear cuenta' })).toHaveAttribute('href', '/registro')
    })
})
