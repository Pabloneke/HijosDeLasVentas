import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminUsuarios from './AdminUsuarios'
import { renderWithProviders } from '../../test/renderWithProviders'
import { initDB } from '../../services/db'
import { iniciarSesion } from '../../test/authFixtures'
import { api } from '../../services/api'

vi.mock('../../services/api', async (importOriginal) => ({
    ...(await importOriginal()),
    api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

// Usuarios como los devuelve el backend (la contraseña nunca viaja en el GET: es WRITE_ONLY)
const usuariosApi = [
    { id: 1, run: '190110222', nombre: 'Paulo', apellidos: 'Catalán', correo: 'admin@duoc.cl', tipo: 'administrador', direccion: 'Av. Siempre Viva 123', region: 'Región Metropolitana de Santiago', comuna: 'Santiago' },
    { id: 2, run: '182345679', nombre: 'Mauricio', apellidos: 'Ahumada', correo: 'vendedor@duoc.cl', tipo: 'vendedor', direccion: 'Calle Los Alerces 456', region: 'Región del Biobío', comuna: 'Concepción' },
    { id: 3, run: '20987654K', nombre: 'Carla', apellidos: 'Gómez', correo: 'carla@gmail.com', tipo: 'cliente', direccion: 'Pasaje Las Rosas 789', region: 'Región de Valparaíso', comuna: 'Viña del Mar' },
]

const filas = () => within(screen.getByRole('table', { name: 'Usuarios' })).getAllByRole('row').slice(1)
const esperarTabla = () => screen.findByRole('table', { name: 'Usuarios' })

// Completa el formulario de usuario con datos válidos (RUN 124543215 es válido; se puede sobrescribir)
const completarFormulario = async (datos = {}) => {
    const d = {
        run: '124543215', nombre: 'Ana', apellidos: 'Pérez', correo: 'ana@duoc.cl', password: 'abc123',
        tipo: 'vendedor', region: 'Región del Biobío', comuna: 'Concepción', direccion: 'Calle 1', ...datos,
    }
    await userEvent.type(screen.getByLabelText('RUN'), d.run)
    await userEvent.selectOptions(screen.getByLabelText('Tipo de usuario'), d.tipo)
    await userEvent.type(screen.getByLabelText('Nombre'), d.nombre)
    await userEvent.type(screen.getByLabelText('Apellidos'), d.apellidos)
    await userEvent.type(screen.getByLabelText('Correo electrónico'), d.correo)
    await userEvent.type(screen.getByLabelText('Contraseña'), d.password)
    await userEvent.selectOptions(screen.getByLabelText('Región'), d.region)
    await userEvent.selectOptions(screen.getByLabelText('Comuna'), d.comuna)
    await userEvent.type(screen.getByLabelText('Dirección'), d.direccion)
}

describe('AdminUsuarios', () => {
    beforeEach(() => {
        initDB() // solo para la sesión: los datos ya vienen de la API
        iniciarSesion('admin@duoc.cl')
        api.get.mockResolvedValue(usuariosApi)
    })

    // Render de lista: una fila por usuario, con el tipo legible
    it('lista los usuarios con su RUN, correo y tipo', async () => {
        renderWithProviders(<AdminUsuarios />)
        await esperarTabla()

        expect(filas()).toHaveLength(3)
        expect(within(filas()[0]).getByText('admin@duoc.cl')).toBeInTheDocument()
        expect(within(filas()[0]).getByText('Administrador')).toBeInTheDocument()
        expect(within(filas()[2]).getByText('Cliente')).toBeInTheDocument()
    })

    // Crear: POST /usuarios con el tipo elegido
    it('crea un usuario con POST /usuarios y el tipo elegido', async () => {
        api.post.mockResolvedValue({ id: 4, run: '124543215', nombre: 'Ana', apellidos: 'Pérez', correo: 'ana@duoc.cl', tipo: 'vendedor' })
        renderWithProviders(<AdminUsuarios />)
        await esperarTabla()

        await userEvent.click(screen.getByRole('button', { name: '+ Nuevo usuario' }))
        await completarFormulario()
        await userEvent.click(screen.getByRole('button', { name: 'Guardar usuario' }))

        await waitFor(() => expect(filas()).toHaveLength(4))
        expect(api.post).toHaveBeenCalledWith('/usuarios', expect.objectContaining({
            run: '124543215', tipo: 'vendedor', comuna: 'Concepción', correo: 'ana@duoc.cl', password: 'abc123',
        }))
    })

    // Validación: formulario vacío no guarda y muestra mensajes
    it('muestra errores y no llama a la API si faltan datos', async () => {
        renderWithProviders(<AdminUsuarios />)
        await esperarTabla()

        await userEvent.click(screen.getByRole('button', { name: '+ Nuevo usuario' }))
        await userEvent.click(screen.getByRole('button', { name: 'Guardar usuario' }))

        expect(screen.getByText(/RUN inválido/)).toBeInTheDocument()
        expect(screen.getByText('Debes seleccionar un tipo de usuario')).toBeInTheDocument()
        expect(screen.getByText('La contraseña debe tener entre 4 y 10 caracteres')).toBeInTheDocument()
        expect(api.post).not.toHaveBeenCalled()
    })

    // Unicidad: no se repiten ni el RUN ni el correo
    it('rechaza un RUN o un correo que ya existen', async () => {
        renderWithProviders(<AdminUsuarios />)
        await esperarTabla()

        await userEvent.click(screen.getByRole('button', { name: '+ Nuevo usuario' }))
        await completarFormulario({ run: '190110222' }) // RUN del administrador
        await userEvent.click(screen.getByRole('button', { name: 'Guardar usuario' }))
        expect(screen.getByText('Ya existe un usuario con ese RUN')).toBeInTheDocument()

        await userEvent.clear(screen.getByLabelText('RUN'))
        await userEvent.type(screen.getByLabelText('RUN'), '124543215')
        await userEvent.clear(screen.getByLabelText('Correo electrónico'))
        await userEvent.type(screen.getByLabelText('Correo electrónico'), 'carla@gmail.com')
        await userEvent.click(screen.getByRole('button', { name: 'Guardar usuario' }))
        expect(screen.getByText('El correo ya está registrado')).toBeInTheDocument()
        expect(api.post).not.toHaveBeenCalled()
    })

    // Un fallo del backend (ej. 403, red) se muestra como aviso y el formulario sigue abierto
    it('muestra el error del backend si el POST falla', async () => {
        api.post.mockRejectedValue(new Error('Acceso denegado'))
        renderWithProviders(<AdminUsuarios />)
        await esperarTabla()

        await userEvent.click(screen.getByRole('button', { name: '+ Nuevo usuario' }))
        await completarFormulario()
        await userEvent.click(screen.getByRole('button', { name: 'Guardar usuario' }))

        expect(await screen.findByRole('alert')).toHaveTextContent('Acceso denegado')
        expect(screen.getByRole('button', { name: 'Guardar usuario' })).toBeInTheDocument()
    })

    // Editar: parte con los datos actuales, el RUN no se cambia y la contraseña vacía no se envía
    it('edita un usuario con PUT cambiando su tipo sin enviar contraseña', async () => {
        api.put.mockImplementation(async (ruta, body) => body)
        renderWithProviders(<AdminUsuarios />)
        await esperarTabla()

        await userEvent.click(screen.getByRole('button', { name: 'Editar carla@gmail.com' }))
        expect(screen.getByLabelText('RUN')).toBeDisabled()
        expect(screen.getByLabelText('Nombre')).toHaveValue('Carla')
        await userEvent.selectOptions(screen.getByLabelText('Tipo de usuario'), 'vendedor')
        await userEvent.click(screen.getByRole('button', { name: 'Guardar usuario' }))

        await waitFor(() => expect(within(filas()[2]).getByText('Vendedor')).toBeInTheDocument())
        const [ruta, body] = api.put.mock.calls[0]
        expect(ruta).toBe('/usuarios/3')
        expect(body).toMatchObject({ id: 3, run: '20987654K', tipo: 'vendedor' })
        expect(body).not.toHaveProperty('password') // vacía = no cambiarla
    })

    // Protección: el único administrador no puede dejar de serlo
    it('no permite quitarle el rol al único administrador', async () => {
        renderWithProviders(<AdminUsuarios />)
        await esperarTabla()

        await userEvent.click(screen.getByRole('button', { name: 'Editar admin@duoc.cl' }))
        await userEvent.selectOptions(screen.getByLabelText('Tipo de usuario'), 'cliente')
        await userEvent.click(screen.getByRole('button', { name: 'Guardar usuario' }))

        expect(screen.getByText('Debe quedar al menos un administrador')).toBeInTheDocument()
        expect(api.put).not.toHaveBeenCalled()
    })

    // Eliminar con confirmación (mock de window.confirm)
    it('elimina un usuario con DELETE solo si se confirma', async () => {
        api.delete.mockResolvedValue(null)
        const confirmar = vi.spyOn(window, 'confirm')
        renderWithProviders(<AdminUsuarios />)
        await esperarTabla()

        confirmar.mockReturnValue(false)
        await userEvent.click(screen.getByRole('button', { name: 'Eliminar carla@gmail.com' }))
        expect(filas()).toHaveLength(3)
        expect(api.delete).not.toHaveBeenCalled()

        confirmar.mockReturnValue(true)
        await userEvent.click(screen.getByRole('button', { name: 'Eliminar carla@gmail.com' }))
        await waitFor(() => expect(filas()).toHaveLength(2))
        expect(api.delete).toHaveBeenCalledWith('/usuarios/3')
    })

    // Protección: nadie elimina su propia cuenta ni al último administrador
    it('no permite eliminar la propia cuenta', async () => {
        const confirmar = vi.spyOn(window, 'confirm').mockReturnValue(true)
        renderWithProviders(<AdminUsuarios />)
        await esperarTabla()

        await userEvent.click(screen.getByRole('button', { name: 'Eliminar admin@duoc.cl' }))

        expect(screen.getByRole('alert')).toHaveTextContent('No puedes eliminar tu propia cuenta.')
        expect(confirmar).not.toHaveBeenCalled()
        expect(api.delete).not.toHaveBeenCalled()
    })
})
