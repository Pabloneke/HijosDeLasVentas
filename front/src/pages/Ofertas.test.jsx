import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { CartProvider } from '../context/CartContext'
import Ofertas from './Ofertas'
import { crearOfertas } from '../utils/ofertas'
import { getProducts } from '../services/db'

vi.mock('../services/db', () => ({
    getProducts: vi.fn(),
}))

const productos = [
    { id: 1, name: 'Perfume Rasasi Hawas', price: 65000, category: 'Perfumería', image: '/img/a.webp' },
    { id: 2, name: 'MousePad XXL Gamer', price: 15000, category: 'Computación', image: '/img/b.webp' },
    { id: 3, name: 'Teclado Mecánico RGB', price: 45000, category: 'Computación', image: '/img/c.webp' },
]

const renderOfertas = () => render(
    <MemoryRouter>
        <CartProvider><Ofertas /></CartProvider>
    </MemoryRouter>
)

describe('Ofertas', () => {
    it('selecciona productos reales y calcula precio y porcentaje correctamente', () => {
        expect(crearOfertas(productos)).toEqual([
            expect.objectContaining({ id: 1, originalPrice: 65000, price: 52000, discountPercent: 20 }),
            expect.objectContaining({ id: 3, originalPrice: 45000, price: 38250, discountPercent: 15 }),
        ])
    })

    it('muestra solo los productos configurados como oferta', () => {
        getProducts.mockReturnValue(productos)
        renderOfertas()

        expect(screen.getByRole('heading', { name: 'Perfume Rasasi Hawas' })).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Teclado Mecánico RGB' })).toBeInTheDocument()
        expect(screen.queryByRole('heading', { name: 'MousePad XXL Gamer' })).not.toBeInTheDocument()
        expect(screen.getAllByRole('button', { name: 'Agregar al carrito' })).toHaveLength(2)
        expect(screen.getByText('-20%')).toBeInTheDocument()
    })

    it('agrega la oferta al carrito global con el precio rebajado', async () => {
        getProducts.mockReturnValue(productos)
        renderOfertas()

        await userEvent.click(screen.getAllByRole('button', { name: 'Agregar al carrito' })[0])

        expect(JSON.parse(localStorage.getItem('carrito'))).toEqual([
            {
                id: 1,
                name: 'Perfume Rasasi Hawas',
                price: 52000,
                image: '/img/a.webp',
                quantity: 1,
            },
        ])
    })
})
