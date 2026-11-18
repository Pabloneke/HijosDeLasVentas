import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom'
import { CartProvider } from '../context/CartContext'
import DetalleProducto from './DetalleProducto'
import { api } from '../services/api'

vi.mock('../services/api', () => ({
    api: { get: vi.fn() },
}))

const renderDetalle = (id) => render(
    <MemoryRouter initialEntries={[`/producto/${id}`]}>
        <CartProvider>
            <Routes><Route path="/producto/:id" element={<DetalleProducto />} /></Routes>
        </CartProvider>
    </MemoryRouter>
)

describe('DetalleProducto', () => {
    it('pide GET /productos/{id} y muestra el producto con su categoría como texto', async () => {
        api.get.mockResolvedValue({
            id: 3, name: 'Teclado Mecánico RGB', price: 45000, stock: 4, image: '/img/Teclado.webp',
            category: { id: 1, nombre: 'Computación' },
        })

        renderDetalle(3)

        expect(await screen.findByRole('heading', { name: 'Teclado Mecánico RGB' })).toBeInTheDocument()
        expect(api.get).toHaveBeenCalledWith('/productos/3')
        expect(screen.getByText('Computación')).toBeInTheDocument()
    })

    it('si el backend responde 404 muestra "Producto no encontrado" (sin parpadearlo antes de tiempo)', async () => {
        api.get.mockRejectedValue(Object.assign(new Error('No encontrado'), { status: 404 }))

        renderDetalle(999)

        expect(screen.queryByText('Producto no encontrado')).not.toBeInTheDocument() // aún cargando
        expect(await screen.findByText('Producto no encontrado')).toBeInTheDocument()
    })

    it('un fallo del servidor (500) muestra el error y no "Producto no encontrado"', async () => {
        api.get.mockRejectedValue(Object.assign(new Error('Error 500'), { status: 500 }))

        renderDetalle(3)

        expect(await screen.findByRole('alert')).toHaveTextContent('Error 500')
        expect(screen.queryByText('Producto no encontrado')).not.toBeInTheDocument()
    })

    it('ignora la respuesta vieja si el id cambia antes de que llegue', async () => {
        const producto = (id) => ({ id, name: `Producto ${id}`, price: 1000, stock: 1, category: { id: 1, nombre: 'X' } })
        let responderPrimero
        api.get.mockImplementation((ruta) => (ruta.endsWith('/1')
            ? new Promise((resolve) => { responderPrimero = resolve }) // el 1 responde tarde
            : Promise.resolve(producto(2))))
        render(
            <MemoryRouter initialEntries={['/producto/1']}>
                <CartProvider>
                    <Link to="/producto/2">ir al 2</Link>
                    <Routes><Route path="/producto/:id" element={<DetalleProducto />} /></Routes>
                </CartProvider>
            </MemoryRouter>
        )

        await userEvent.click(screen.getByRole('link', { name: 'ir al 2' }))
        expect(await screen.findByRole('heading', { name: 'Producto 2' })).toBeInTheDocument()
        await act(async () => responderPrimero(producto(1))) // llega la respuesta vieja

        expect(screen.getByRole('heading', { name: 'Producto 2' })).toBeInTheDocument()
        expect(screen.queryByRole('heading', { name: 'Producto 1' })).not.toBeInTheDocument()
    })
})
