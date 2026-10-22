import { render, screen, within } from '@testing-library/react'
import Boleta from './Boleta'
import { formatPrice } from '../../utils/precios'

const orden = {
    id: 7,
    fecha: '2026-10-22T15:30:00.000Z',
    cliente: { userId: 3, nombre: 'Ana Pérez', correo: 'ana@duoc.cl' },
    items: [
        { id: 2, name: 'MousePad XXL Gamer', price: 15000, quantity: 2 },
        { id: 3, name: 'Teclado Mecánico RGB', price: 45000, quantity: 1 },
    ],
    total: 75000,
    entrega: { modalidad: 'despacho', region: 'Región Metropolitana de Santiago', comuna: 'Santiago', direccion: 'Calle 1' },
}

describe('Boleta', () => {
    it('muestra el número, el cliente y los productos comprados con sus cantidades', () => {
        render(<Boleta orden={orden} />)

        expect(screen.getByText('N° HV-000007')).toBeInTheDocument()
        expect(screen.getByText('Ana Pérez')).toBeInTheDocument()
        expect(screen.getByText('ana@duoc.cl')).toBeInTheDocument()

        const fila = screen.getByRole('row', { name: /MousePad XXL Gamer/ })
        expect(within(fila).getByText('2')).toBeInTheDocument()
        expect(within(fila).getByText(formatPrice(30000))).toBeInTheDocument()
        expect(screen.getByRole('row', { name: /Teclado Mecánico RGB/ })).toBeInTheDocument()
    })

    it('desglosa neto, IVA 19% y total con IVA incluido', () => {
        render(<Boleta orden={orden} />)

        // 75000 con IVA incluido -> neto 63025, IVA 11975
        expect(screen.getByText('Neto').nextSibling).toHaveTextContent(formatPrice(63025))
        expect(screen.getByText('IVA (19%)').nextSibling).toHaveTextContent(formatPrice(11975))
        expect(screen.getByText('Total').nextSibling).toHaveTextContent(formatPrice(75000))
    })

    it('indica el tipo de entrega: despacho con dirección o retiro coordinado', () => {
        const { rerender } = render(<Boleta orden={orden} />)
        expect(screen.getByText(/Despacho a Calle 1, Santiago/)).toBeInTheDocument()

        rerender(<Boleta orden={{ ...orden, entrega: { modalidad: 'retiro' } }} />)
        expect(screen.getByText(/Retiro coordinado/)).toBeInTheDocument()
    })
})
