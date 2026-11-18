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

    it('aplica el descuento del backend: muestra el precio rebajado y agrega ese precio al carrito', async () => {
        api.get.mockResolvedValue({
            id: 1, name: 'Perfume Rasasi Hawas', price: 65000, descuento: 20, stock: 12, image: '/img/a.webp',
            category: { id: 4, nombre: 'Perfumería' },
        })

        renderDetalle(1)

        expect(await screen.findByText('-20%')).toBeInTheDocument()
        expect(screen.getByText('$65.000')).toHaveClass('text-decoration-line-through')
        expect(screen.getByText('$52.000')).toBeInTheDocument()
        await userEvent.click(screen.getByRole('button', { name: /Añadir al Carrito/ }))
        expect(JSON.parse(localStorage.getItem('carrito'))[0]).toMatchObject({ id: 1, price: 52000 })
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
