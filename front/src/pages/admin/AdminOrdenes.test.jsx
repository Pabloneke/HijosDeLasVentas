import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminOrdenes from './AdminOrdenes'
import { renderWithProviders } from '../../test/renderWithProviders'
import { iniciarSesion } from '../../test/authFixtures'
import { api } from '../../services/api'
import { formatPrice } from '../../utils/precios'

vi.mock('../../services/api', async (importOriginal) => ({
    ...(await importOriginal()),
    api: { get: vi.fn() },
}))

// Boletas como las devuelve GET /boletas
const boletasApi = [
    {
        id: 1, fecha: '2026-10-01T12:00:00', total: 130000, clienteNombre: 'Ana Pérez', clienteCorreo: 'ana@duoc.cl',
        modalidadEntrega: 'despacho', direccionEntrega: 'Calle 1', regionEntrega: 'Región Metropolitana de Santiago', comunaEntrega: 'Santiago',
        usuario: null,
        items: [{ id: 1, quantity: 2, price: 65000, producto: { id: 1, name: 'Perfume Rasasi Hawas' } }],
    },
    {
        id: 2, fecha: '2026-10-05T15:30:00', total: 45000, clienteNombre: 'Carla Gómez', clienteCorreo: 'carla@gmail.com',
        modalidadEntrega: 'retiro', usuario: { id: 3, nombre: 'Carla', apellidos: 'Gómez', correo: 'carla@gmail.com' },
        items: [{ id: 2, quantity: 1, price: 45000, producto: { id: 3, name: 'Teclado Mecánico RGB' } }],
    },
]

describe('AdminOrdenes', () => {
    beforeEach(() => {
        iniciarSesion('vendedor@duoc.cl') // el rol más restringido que puede entrar aquí
        api.get.mockResolvedValue(boletasApi)
    })

    it('lista las órdenes desde GET /boletas con número, cliente y total', async () => {
        renderWithProviders(<AdminOrdenes />)

        const filas = within(await screen.findByRole('table', { name: 'Órdenes' })).getAllByRole('row').slice(1)
        expect(api.get).toHaveBeenCalledWith('/boletas')
        expect(filas).toHaveLength(2)
        expect(within(filas[0]).getByText('HV-000001')).toBeInTheDocument()
        expect(within(filas[0]).getByText('Ana Pérez')).toBeInTheDocument()
        expect(within(filas[0]).getByText(formatPrice(130000))).toBeInTheDocument()
    })

    it('"Ver detalle" muestra la boleta completa y "Cerrar" la oculta', async () => {
        renderWithProviders(<AdminOrdenes />)

        await userEvent.click(await screen.findByRole('button', { name: 'Ver detalle HV-000001' }))

        const detalle = screen.getByRole('article', { name: 'Boleta HV-000001' })
        expect(within(detalle).getByText('Perfume Rasasi Hawas')).toBeInTheDocument()
        expect(within(detalle).getByText(/Despacho a Calle 1, Santiago/)).toBeInTheDocument()

        await userEvent.click(screen.getByRole('button', { name: 'Cerrar' }))
        expect(screen.queryByRole('article', { name: /Boleta/ })).not.toBeInTheDocument()
    })

    // Es solo lectura: nadie crea, edita ni elimina órdenes
    it('no ofrece acciones para crear, editar ni eliminar', async () => {
        renderWithProviders(<AdminOrdenes />)
        await screen.findByRole('table', { name: 'Órdenes' })

        expect(screen.queryByRole('button', { name: /nuev|crear|editar|eliminar/i })).not.toBeInTheDocument()
    })
})
