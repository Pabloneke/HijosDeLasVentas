import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Home from './Home'

describe('Home', () => {
    it('muestra el hero, las estadísticas, la descripción y el video', () => {
        render(
            <MemoryRouter>
                <Home />
            </MemoryRouter>
        )

        expect(screen.getByRole('heading', { name: /Bienvenido a tu tienda rápida y confiable/ })).toBeInTheDocument()
        expect(screen.getByText('Tu tienda online')).toBeInTheDocument()
        expect(screen.getByText('+500')).toBeInTheDocument()
        expect(screen.getByText('24h')).toBeInTheDocument()
        expect(screen.getByText('100%')).toBeInTheDocument()
        expect(screen.getByText(/emprendimiento hecho por amigos/)).toBeInTheDocument()
        expect(screen.getByTitle('Video de Hijos de las Ventas')).toHaveAttribute(
            'src',
            'https://www.youtube.com/embed/zj4CNZsCKC4?start=216'
        )
    })

    it('mantiene los enlaces principales del hero', () => {
        render(
            <MemoryRouter>
                <Home />
            </MemoryRouter>
        )

        expect(screen.getByRole('link', { name: 'Hacer un pedido ahora' })).toHaveAttribute('href', '/contacto')
        expect(screen.getByRole('link', { name: 'Ver productos' })).toHaveAttribute('href', '/productos')
    })

    it('renderiza la cinta promocional repetida', () => {
        render(
            <MemoryRouter>
                <Home />
            </MemoryRouter>
        )

        expect(screen.getByLabelText('Promoción de Hijos de las Ventas')).toBeInTheDocument()
        expect(screen.getAllByText(/HIJOS DE LAS VENTAS/)).toHaveLength(2)
    })
})
