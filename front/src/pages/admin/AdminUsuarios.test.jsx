import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminUsuarios from './AdminUsuarios'
import { renderWithProviders } from '../../test/renderWithProviders'
import { initDB, login, getUsers, findUserByEmail } from '../../services/db'

const filas = () => within(screen.getByRole('table', { name: 'Usuarios' })).getAllByRole('row').slice(1)

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
        initDB()
        login('admin@duoc.cl', 'admin123')
    })

    // Render de lista: una fila por usuario, con el tipo legible
    it('lista los usuarios con su RUN, correo y tipo', () => {
        renderWithProviders(<AdminUsuarios />)

        expect(filas()).toHaveLength(3)
        expect(within(filas()[0]).getByText('admin@duoc.cl')).toBeInTheDocument()
        expect(within(filas()[0]).getByText('Administrador')).toBeInTheDocument()
        expect(within(filas()[2]).getByText('Cliente')).toBeInTheDocument()
    })

    // Crear: el usuario queda guardado con el tipo elegido y puede iniciar sesión
    it('crea un usuario con el tipo elegido', async () => {
        renderWithProviders(<AdminUsuarios />)

        await userEvent.click(screen.getByRole('button', { name: '+ Nuevo usuario' }))
        await completarFormulario()
        await userEvent.click(screen.getByRole('button', { name: 'Guardar usuario' }))

        expect(filas()).toHaveLength(4)
        expect(findUserByEmail('ana@duoc.cl')).toMatchObject({ run: '124543215', tipo: 'vendedor', comuna: 'Concepción' })
    })

    // Validación: formulario vacío no guarda y muestra mensajes
    it('muestra errores y no guarda si faltan datos', async () => {
        renderWithProviders(<AdminUsuarios />)

        await userEvent.click(screen.getByRole('button', { name: '+ Nuevo usuario' }))
        await userEvent.click(screen.getByRole('button', { name: 'Guardar usuario' }))

        expect(screen.getByText(/RUN inválido/)).toBeInTheDocument()
        expect(screen.getByText('Debes seleccionar un tipo de usuario')).toBeInTheDocument()
        expect(screen.getByText('La contraseña debe tener entre 4 y 10 caracteres')).toBeInTheDocument()
        expect(getUsers()).toHaveLength(3)
    })

    // Unicidad: no se repiten ni el RUN ni el correo
    it('rechaza un RUN o un correo que ya existen', async () => {
        renderWithProviders(<AdminUsuarios />)

        await userEvent.click(screen.getByRole('button', { name: '+ Nuevo usuario' }))
        await completarFormulario({ run: '190110222' }) // RUN del administrador sembrado
        await userEvent.click(screen.getByRole('button', { name: 'Guardar usuario' }))
        expect(screen.getByText('Ya existe un usuario con ese RUN')).toBeInTheDocument()

        await userEvent.clear(screen.getByLabelText('RUN'))
        await userEvent.type(screen.getByLabelText('RUN'), '124543215')
        await userEvent.clear(screen.getByLabelText('Correo electrónico'))
        await userEvent.type(screen.getByLabelText('Correo electrónico'), 'carla@gmail.com')
        await userEvent.click(screen.getByRole('button', { name: 'Guardar usuario' }))
        expect(screen.getByText('El correo ya está registrado')).toBeInTheDocument()
        expect(getUsers()).toHaveLength(3)
    })

    // Editar: parte con los datos actuales, el RUN no se cambia y la contraseña vacía no se modifica
    it('edita un usuario cambiando su tipo sin tocar la contraseña ni el RUN', async () => {
        renderWithProviders(<AdminUsuarios />)

        await userEvent.click(screen.getByRole('button', { name: 'Editar carla@gmail.com' }))
        expect(screen.getByLabelText('RUN')).toBeDisabled()
        expect(screen.getByLabelText('Nombre')).toHaveValue('Carla')
        await userEvent.selectOptions(screen.getByLabelText('Tipo de usuario'), 'vendedor')
        await userEvent.click(screen.getByRole('button', { name: 'Guardar usuario' }))

        const carla = findUserByEmail('carla@gmail.com')
        expect(carla.tipo).toBe('vendedor')
        expect(carla.password).toBe('cliente123')
        expect(within(filas()[2]).getByText('Vendedor')).toBeInTheDocument()
    })

    // Protección: el único administrador no puede dejar de serlo
    it('no permite quitarle el rol al único administrador', async () => {
        renderWithProviders(<AdminUsuarios />)

        await userEvent.click(screen.getByRole('button', { name: 'Editar admin@duoc.cl' }))
        await userEvent.selectOptions(screen.getByLabelText('Tipo de usuario'), 'cliente')
        await userEvent.click(screen.getByRole('button', { name: 'Guardar usuario' }))

        expect(screen.getByText('Debe quedar al menos un administrador')).toBeInTheDocument()
        expect(findUserByEmail('admin@duoc.cl').tipo).toBe('administrador')
    })

    // Eliminar con confirmación (mock de window.confirm)
    it('elimina un usuario solo si se confirma', async () => {
        const confirmar = vi.spyOn(window, 'confirm')
        renderWithProviders(<AdminUsuarios />)

        confirmar.mockReturnValue(false)
        await userEvent.click(screen.getByRole('button', { name: 'Eliminar carla@gmail.com' }))
        expect(filas()).toHaveLength(3)

        confirmar.mockReturnValue(true)
        await userEvent.click(screen.getByRole('button', { name: 'Eliminar carla@gmail.com' }))
        expect(filas()).toHaveLength(2)
        expect(findUserByEmail('carla@gmail.com')).toBeNull()
    })

    // Protección: nadie elimina su propia cuenta ni al último administrador
    it('no permite eliminar la propia cuenta', async () => {
        const confirmar = vi.spyOn(window, 'confirm').mockReturnValue(true)
        renderWithProviders(<AdminUsuarios />)

        await userEvent.click(screen.getByRole('button', { name: 'Eliminar admin@duoc.cl' }))

        expect(screen.getByRole('alert')).toHaveTextContent('No puedes eliminar tu propia cuenta.')
        expect(confirmar).not.toHaveBeenCalled()
        expect(findUserByEmail('admin@duoc.cl')).not.toBeNull()
    })
})
