import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import { CartProvider } from '../context/CartContext'
import { api } from '../services/api'
import Checkout from './Checkout'

vi.mock('../services/api', async (importOriginal) => ({
    ...(await importOriginal()),
    api: { post: vi.fn() },
}))

// Boleta como la devuelve POST /boletas
const boletaApi = {
    id: 1, fecha: '2026-10-22T15:30:00', total: 130000,
    clienteNombre: 'Ana Pérez', clienteCorreo: 'ana@duoc.cl',
    modalidadEntrega: 'despacho', direccionEntrega: 'Calle 1',
    regionEntrega: 'Región Metropolitana de Santiago', comunaEntrega: 'Santiago',
    usuario: null,
    items: [{ id: 1, quantity: 2, price: 65000, producto: { id: 1, name: 'Perfume Rasasi Hawas' } }],
}

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

    it('confirma la compra con POST /boletas y vacía el carrito', async () => {
        api.post.mockResolvedValue(boletaApi)
        renderCheckout()

        await completarYConfirmar()

        expect(await screen.findByText('Solicitud de compra registrada')).toBeInTheDocument()
        expect(screen.getByText(/No se realizó ningún cobro/)).toBeInTheDocument()
        expect(api.post).toHaveBeenCalledWith('/boletas', {
            clienteNombre: 'Ana Pérez',
            clienteCorreo: 'ana@duoc.cl',
            modalidadEntrega: 'despacho',
            regionEntrega: 'Región Metropolitana de Santiago',
            comunaEntrega: 'Santiago',
            direccionEntrega: 'Calle 1',
            items: [{ producto: { id: 1 }, quantity: 2 }],
        })
        expect(JSON.parse(localStorage.getItem('carrito'))).toEqual([])
    })

    it('no confirma la compra si el backend rechaza por stock insuficiente', async () => {
        api.post.mockRejectedValue(new Error('Stock insuficiente. Perfume Rasasi Hawas: solo quedan 12 unidades'))
        renderCheckout([{ ...producto, quantity: 999 }])

        await completarYConfirmar()

        expect(await screen.findByRole('alert')).toHaveTextContent(/Perfume Rasasi Hawas: solo quedan 12 unidades/)
        expect(screen.queryByText('Solicitud de compra registrada')).not.toBeInTheDocument()
        expect(JSON.parse(localStorage.getItem('carrito'))).toHaveLength(1)
    })

    it('permite ver e imprimir la boleta aunque el carrito ya esté vacío', async () => {
        const print = vi.spyOn(window, 'print').mockImplementation(() => {})
        api.post.mockResolvedValue(boletaApi)
        renderCheckout()
        await completarYConfirmar()
        await screen.findByText('Solicitud de compra registrada')
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
