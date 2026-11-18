import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
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
})
