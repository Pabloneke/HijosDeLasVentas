import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { CartProvider } from '../context/CartContext'
import { api } from '../services/api'
import Carrito from './Carrito'

vi.mock('../services/api', () => ({
    api: { get: vi.fn() },
}))

// Teclado Mecánico RGB: stock 4 en el backend
const teclado = { id: 3, name: 'Teclado Mecánico RGB', price: 45000, image: '/img/Teclado.webp', quantity: 2, stock: 4 }

const renderCarrito = (stockEnBackend = 4) => {
    api.get.mockResolvedValue([{ id: 3, stock: stockEnBackend }])
    localStorage.setItem('carrito', JSON.stringify([teclado]))
    return render(
        <MemoryRouter>
            <CartProvider><Carrito /></CartProvider>
        </MemoryRouter>
    )
}

const cantidadGuardada = () => JSON.parse(localStorage.getItem('carrito'))[0]?.quantity

describe('Carrito — cantidad', () => {
    it('al borrar el número del input no elimina el producto', async () => {
        renderCarrito()
        const input = screen.getByLabelText('Cantidad')

        await userEvent.clear(input)

        expect(screen.getByText('Teclado Mecánico RGB')).toBeInTheDocument()
        expect(input).toHaveValue(null) // vacío mientras se edita
        expect(cantidadGuardada()).toBe(2)
    })

    it('permite borrar y escribir otra cantidad', async () => {
        renderCarrito()
        const input = screen.getByLabelText('Cantidad')

        await userEvent.clear(input)
        await userEvent.type(input, '3')

        expect(input).toHaveValue(3)
        expect(cantidadGuardada()).toBe(3)
    })

    it('al salir del campo vacío vuelve a la última cantidad válida', async () => {
        renderCarrito()
        const input = screen.getByLabelText('Cantidad')

        await userEvent.clear(input)
        await userEvent.tab()

        expect(input).toHaveValue(2)
        expect(cantidadGuardada()).toBe(2)
    })

    it('limita la cantidad escrita al stock disponible', async () => {
        renderCarrito()
        const input = screen.getByLabelText('Cantidad')

        await userEvent.clear(input)
        await userEvent.type(input, '999')

        expect(input).toHaveValue(4)
        expect(cantidadGuardada()).toBe(4)
    })

    it('al entrar recorta la cantidad al stock vigente que devuelve GET /productos', async () => {
        renderCarrito(1) // el admin bajó el stock a 1 mientras el cliente tenía 2 en el carrito

        await waitFor(() => expect(cantidadGuardada()).toBe(1))
    })

    it('el botón Eliminar sí quita el producto', async () => {
        renderCarrito()

        await userEvent.click(screen.getByRole('button', { name: 'Eliminar' }))

        expect(screen.getByText('Tu carrito está vacío.')).toBeInTheDocument()
    })
})
