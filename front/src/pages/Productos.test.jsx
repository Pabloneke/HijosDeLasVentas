import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Productos from './Productos'
import { api } from '../services/api'
import { CartProvider } from '../context/CartContext'

// Mock: reemplazamos el cliente HTTP por uno falso.
// Así Productos no llama al backend real y controlamos qué datos recibe.
vi.mock('../services/api', () => ({
    api: { get: vi.fn() },
}))

const productosFalsos = [
    { id: 1, name: 'Perfume Rasasi Hawas', price: 65000, category: { id: 4, nombre: 'Perfumería' }, image: '/img/a.webp' },
    { id: 2, name: 'MousePad XXL Gamer', price: 15000, category: { id: 1, nombre: 'Computación' }, image: '/img/b.webp' },
    { id: 3, name: 'Juego PS4', price: 20000, category: { id: 2, nombre: 'Gaming' }, image: '/img/c.webp' },
]

describe('Productos', () => {
    const renderProductos = () => render(
        <CartProvider><Productos /></CartProvider>
    )

    // Prueba 5 (render de lista + mock): una tarjeta por cada producto de la "base de datos"
    it('renderiza una tarjeta por cada producto devuelto por GET /productos', async () => {
        api.get.mockResolvedValue(productosFalsos)

        renderProductos()

        expect(await screen.findAllByRole('button', { name: 'Lo quiero' })).toHaveLength(productosFalsos.length)
        productosFalsos.forEach((p) => {
            expect(screen.getByRole('heading', { name: p.name })).toBeInTheDocument()
        })
    })

    // Prueba 6 (render condicional): sin productos se muestra el mensaje y no hay tarjetas
    it('muestra "No hay productos disponibles." cuando la lista está vacía', async () => {
        api.get.mockResolvedValue([])

        renderProductos()

        expect(await screen.findByText('No hay productos disponibles.')).toBeInTheDocument()
        expect(screen.queryByRole('button', { name: 'Lo quiero' })).not.toBeInTheDocument()
    })

    // Prueba 7: el clic guarda el producto y muestra la confirmación no bloqueante
    it('agrega el producto al carrito y muestra confirmación', async () => {
        api.get.mockResolvedValue(productosFalsos)

        renderProductos()
        await userEvent.click((await screen.findAllByRole('button', { name: 'Lo quiero' }))[0])

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
        api.get.mockResolvedValue(productosFalsos)
        renderProductos()
        const user = userEvent.setup()
        await screen.findAllByRole('button', { name: 'Lo quiero' }) // espera la respuesta de la API

        await user.click(screen.getAllByRole('button', { name: 'Lo quiero' })[0])
        await user.click(screen.getByRole('button', { name: '¡Agregado!' }))
        await user.click(screen.getAllByRole('button', { name: 'Lo quiero' })[0])

        expect(JSON.parse(localStorage.getItem('carrito'))).toEqual([
            expect.objectContaining({ id: 1, quantity: 2 }),
            expect.objectContaining({ id: 2, quantity: 1 }),
        ])
    })
})
