import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Productos from './Productos'
import { getProducts } from '../services/db'

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
    // Prueba 5 (render de lista + mock): una tarjeta por cada producto de la "base de datos"
    it('renderiza una tarjeta por cada producto devuelto por getProducts', () => {
        getProducts.mockReturnValue(productosFalsos)

        render(<Productos />)

        expect(screen.getAllByRole('button', { name: 'Lo quiero' })).toHaveLength(productosFalsos.length)
        productosFalsos.forEach((p) => {
            expect(screen.getByRole('heading', { name: p.name })).toBeInTheDocument()
        })
    })

    // Prueba 6 (render condicional): sin productos se muestra el mensaje y no hay tarjetas
    it('muestra "No hay productos disponibles." cuando la lista está vacía', () => {
        getProducts.mockReturnValue([])

        render(<Productos />)

        expect(screen.getByText('No hay productos disponibles.')).toBeInTheDocument()
        expect(screen.queryByRole('button', { name: 'Lo quiero' })).not.toBeInTheDocument()
    })

    // Prueba 7 (evento + mock de window.alert): el clic en "Lo quiero" avisa al usuario
    it('avisa con alert el producto agregado al hacer clic en "Lo quiero"', async () => {
        getProducts.mockReturnValue(productosFalsos)
        const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

        render(<Productos />)
        await userEvent.click(screen.getAllByRole('button', { name: 'Lo quiero' })[0])

        expect(alertSpy).toHaveBeenCalledTimes(1)
        expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('Perfume Rasasi Hawas'))
    })
})
