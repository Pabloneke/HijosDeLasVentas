import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import { CartProvider } from '../context/CartContext'
import { getOrders, getProductById, initDB } from '../services/db'
import Checkout from './Checkout'

const producto = {
    id: 1,
    name: 'Perfume Rasasi Hawas',
    price: 65000,
    image: '/img/RasasiHawas.webp',
    quantity: 2,
}

const renderCheckout = (items = [producto]) => {
    initDB() // siembra los productos con su stock (el Perfume tiene 12 unidades)
    localStorage.setItem('carrito', JSON.stringify(items))
    return render(
        <MemoryRouter initialEntries={['/checkout']}>
            <AuthProvider>
                <CartProvider><Checkout /></CartProvider>
            </AuthProvider>
        </MemoryRouter>
    )
}

const completarYConfirmar = async () => {
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

    it('confirma la compra, descuenta el stock, registra la orden y vacía el carrito', async () => {
        renderCheckout()

        await completarYConfirmar()

        expect(screen.getByText('Solicitud de compra registrada')).toBeInTheDocument()
        expect(screen.getByText(/No se realizó ningún cobro/)).toBeInTheDocument()
        expect(getProductById(1).stock).toBe(12 - producto.quantity)
        expect(getOrders()).toHaveLength(1)
        expect(JSON.parse(localStorage.getItem('carrito'))).toEqual([])
    })

    it('no confirma la compra si la cantidad supera el stock disponible', async () => {
        renderCheckout([{ ...producto, quantity: 999 }])

        await completarYConfirmar()

        expect(screen.getByRole('alert')).toHaveTextContent(/Perfume Rasasi Hawas: solo quedan 12 unidades/)
        expect(screen.queryByText('Solicitud de compra registrada')).not.toBeInTheDocument()
        expect(getProductById(1).stock).toBe(12)
        expect(getOrders()).toEqual([])
        expect(JSON.parse(localStorage.getItem('carrito'))).toHaveLength(1)
    })

    it('permite ver e imprimir la boleta aunque el carrito ya esté vacío', async () => {
        const print = vi.spyOn(window, 'print').mockImplementation(() => {})
        renderCheckout()
        await completarYConfirmar()
        const user = userEvent.setup()

        expect(screen.queryByRole('article', { name: /Boleta/ })).not.toBeInTheDocument()
        await user.click(screen.getByRole('button', { name: 'Ver boleta' }))

        const boleta = screen.getByRole('article', { name: 'Boleta HV-000001' })
        expect(within(boleta).getByText('Perfume Rasasi Hawas')).toBeInTheDocument()
        expect(within(boleta).getByText('Ana Pérez')).toBeInTheDocument()
        expect(within(boleta).getByText(/Despacho a Calle 1, Santiago/)).toBeInTheDocument()

        await user.click(screen.getByRole('button', { name: 'Imprimir / Guardar PDF' }))
        expect(print).toHaveBeenCalledTimes(1)
        print.mockRestore()
    })
})
