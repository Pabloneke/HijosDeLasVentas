import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from './AuthContext'
import { initDB } from '../services/db'

// Componente de prueba que consume el contexto y expone sus datos y acciones
const Consumidor = () => {
    const { user, login, logout } = useAuth()
    const intentar = (correo, pass) => {
        try {
            login(correo, pass)
        } catch (error) {
            document.title = error.message
        }
    }
    return (
        <div>
            <p>{user ? `Sesión: ${user.nombre}` : 'Sin sesión'}</p>
            <button onClick={() => intentar('admin@duoc.cl', 'admin123')}>entrar</button>
            <button onClick={() => intentar('admin@duoc.cl', 'mala')}>entrar mal</button>
            <button onClick={logout}>salir</button>
        </div>
    )
}

const renderAuth = () => render(<AuthProvider><Consumidor /></AuthProvider>)

describe('AuthContext', () => {
    beforeEach(() => initDB())

    // Prueba 49 (estado global): login actualiza el estado y la sesión sobrevive a una recarga
    it('login actualiza el usuario y se recupera al volver a montar la app', async () => {
        const { unmount } = renderAuth()
        expect(screen.getByText('Sin sesión')).toBeInTheDocument()

        await userEvent.click(screen.getByRole('button', { name: 'entrar' }))
        expect(screen.getByText('Sesión: Paulo')).toBeInTheDocument()

        unmount() // simula recargar la página
        renderAuth()
        expect(screen.getByText('Sesión: Paulo')).toBeInTheDocument()
    })

    // Prueba 50: credenciales malas no cambian el estado; logout lo limpia
    it('un login fallido no inicia sesión y logout la cierra', async () => {
        renderAuth()

        await userEvent.click(screen.getByRole('button', { name: 'entrar mal' }))
        expect(screen.getByText('Sin sesión')).toBeInTheDocument()
        expect(document.title).toBe('Correo o contraseña incorrectos')

        await userEvent.click(screen.getByRole('button', { name: 'entrar' }))
        await userEvent.click(screen.getByRole('button', { name: 'salir' }))
        expect(screen.getByText('Sin sesión')).toBeInTheDocument()
    })

    // Prueba 51 (caso borde): usar el hook sin el Provider es un error de programación
    it('useAuth lanza un error claro fuera de un AuthProvider', () => {
        vi.spyOn(console, 'error').mockImplementation(() => {}) // React loguea el error esperado

        expect(() => render(<Consumidor />)).toThrow('useAuth debe usarse dentro de un AuthProvider')
    })
})
