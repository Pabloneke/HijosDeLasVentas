import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'

// Renderiza un componente con todo lo que necesita en la app real:
// router en memoria (ruta inicial configurable) y sesión.
export const renderWithProviders = (ui, { ruta = '/' } = {}) =>
    render(
        <MemoryRouter initialEntries={[ruta]}>
            <AuthProvider>{ui}</AuthProvider>
        </MemoryRouter>
    )
