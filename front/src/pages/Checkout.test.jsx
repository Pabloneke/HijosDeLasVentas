import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import { CartProvider } from '../context/CartContext'
import Checkout from './Checkout'

const producto = {
    id: 1,
    name: 'Perfume Rasasi Hawas',
    price: 65000,
    image: '/img/RasasiHawas.webp',
    quantity: 2,
}

const renderCheckout = (items = [producto]) => {
    localStorage.setItem('carrito', JSON.stringify(items))
    return render(
        <MemoryRouter initialEntries={['/checkout']}>
            <AuthProvider>
                <CartProvider><Checkout /></CartProvider>
            </AuthProvider>
        </MemoryRouter>
    )
}

describe('Checkout', () => {
    it('impide continuar cuando el carrito está vacío', () => {
        renderCheckout([])

        expect(screen.getByText('No puedes continuar todavía')).toBeInTheDocument()
        expect(screen.queryByRole('button', { name: 'Revisar y confirmar pedido' })).not.toBeInTheDocument()
    })

    it('valida los datos obligatorios antes de confirmar', async () => {
        renderCheckout()

        await userEvent.click(screen.getByRole('button', { name: 'Revisar y confirmar pedido' }))

        expect(screen.getByText(/El nombre solo admite/)).toBeInTheDocument()
        expect(screen.getByText('Ingresa tu correo')).toBeInTheDocument()
        expect(screen.getByText('Selecciona una región')).toBeInTheDocument()
    })

    it('muestra el resumen y confirma una compra de demostración sin vaciar el carrito', async () => {
        renderCheckout()
        const user = userEvent.setup()

        await user.type(screen.getByLabelText('Nombre completo'), 'Ana Pérez')
        await user.type(screen.getByLabelText('Correo electrónico'), 'ana@duoc.cl')
        await user.selectOptions(screen.getByLabelText('Región'), 'Región Metropolitana de Santiago')
        await user.selectOptions(screen.getByLabelText('Comuna'), 'Santiago')
        await user.type(screen.getByLabelText('Dirección de despacho'), 'Calle 1')
        await user.type(screen.getByLabelText('Nombre del titular'), 'Ana Pérez')
        await user.type(screen.getByLabelText('Número de tarjeta'), '4111 1111 1111 1111')
        await user.type(screen.getByLabelText('Vencimiento (MM/AA)'), '12/30')
        await user.type(screen.getByLabelText('CVV'), '123')
        await user.click(screen.getByRole('button', { name: 'Revisar y confirmar pedido' }))

        expect(screen.getByText('Solicitud de compra registrada')).toBeInTheDocument()
        expect(screen.getByText(/No se realizó ningún cobro/)).toBeInTheDocument()
        expect(JSON.parse(localStorage.getItem('carrito'))).toEqual([producto])
    })
})
