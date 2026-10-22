import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Productos from './Productos'
import { getProducts } from '../services/db'
import { CartProvider } from '../context/CartContext'

// Mock: reemplazamos el módulo db.js completo por una versión falsa.
// Así Productos no lee el localStorage real y controlamos qué datos recibe.
vi.mock('../services/db', () => ({
    getProducts: vi.fn(),
}))

const productosFalsos = [
    { id: 1, name: 'Perfume Rasasi Hawas', price: 65000, category: 'Perfumería', image: '/img/a.webp' },
    { id: 2, name: 'MousePad XXL Gamer', price: 15000, category: 'Computación', image: '/img/b.webp' },
    { id: 3, name: 'Juego PS4', price: 20000, category: 'Gaming', image: '/img/c.webp' },
]

describe('Productos', () => {
    const renderProductos = () => render(
        <CartProvider><Productos /></CartProvider>
    )

    // Prueba 5 (render de lista + mock): una tarjeta por cada producto de la "base de datos"
    it('renderiza una tarjeta por cada producto devuelto por getProducts', () => {
        getProducts.mockReturnValue(productosFalsos)

        renderProductos()

        expect(screen.getAllByRole('button', { name: 'Lo quiero' })).toHaveLength(productosFalsos.length)
        productosFalsos.forEach((p) => {
            expect(screen.getByRole('heading', { name: p.name })).toBeInTheDocument()
        })
    })

    // Prueba 6 (render condicional): sin productos se muestra el mensaje y no hay tarjetas
    it('muestra "No hay productos disponibles." cuando la lista está vacía', () => {
        getProducts.mockReturnValue([])

        renderProductos()

        expect(screen.getByText('No hay productos disponibles.')).toBeInTheDocument()
        expect(screen.queryByRole('button', { name: 'Lo quiero' })).not.toBeInTheDocument()
    })

    // Prueba 7: el clic guarda el producto y muestra la confirmación no bloqueante
    it('agrega el producto al carrito y muestra confirmación', async () => {
        getProducts.mockReturnValue(productosFalsos)

        renderProductos()
        await userEvent.click(screen.getAllByRole('button', { name: 'Lo quiero' })[0])

        expect(screen.getByRole('button', { name: '¡Agregado!' })).toBeInTheDocument()
        expect(JSON.parse(localStorage.getItem('carrito'))).toEqual([
            {
                id: productosFalsos[0].id,
                name: productosFalsos[0].name,
                price: 52000,
                image: productosFalsos[0].image,
                quantity: 1,
            },
        ])
    })

    it('incrementa la cantidad al agregar el mismo producto y conserva productos distintos', async () => {
        getProducts.mockReturnValue(productosFalsos)
        renderProductos()
        const user = userEvent.setup()

        await user.click(screen.getAllByRole('button', { name: 'Lo quiero' })[0])
        await user.click(screen.getByRole('button', { name: '¡Agregado!' }))
        await user.click(screen.getAllByRole('button', { name: 'Lo quiero' })[0])

        expect(JSON.parse(localStorage.getItem('carrito'))).toEqual([
            expect.objectContaining({ id: 1, quantity: 2 }),
            expect.objectContaining({ id: 2, quantity: 1 }),
        ])
    })
})
