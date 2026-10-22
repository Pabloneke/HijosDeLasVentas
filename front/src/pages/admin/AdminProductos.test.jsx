import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminProductos from './AdminProductos'
import { renderWithProviders } from '../../test/renderWithProviders'
import { initDB, login, getProducts } from '../../services/db'

const filas = () => within(screen.getByRole('table', { name: 'Productos' })).getAllByRole('row').slice(1)

describe('AdminProductos', () => {
    beforeEach(() => {
        initDB()
        login('admin@duoc.cl', 'admin123')
    })

    // Render de lista: una fila por producto de la "base de datos"
    it('lista todos los productos con su precio, stock y categoría', () => {
        renderWithProviders(<AdminProductos />)

        expect(filas()).toHaveLength(6)
        expect(within(filas()[0]).getByText('Perfume Rasasi Hawas')).toBeInTheDocument()
        expect(within(filas()[0]).getByText('Perfumería')).toBeInTheDocument()
    })

    // Render condicional por rol: el vendedor consulta, pero no puede crear, editar ni eliminar
    it('el vendedor ve la tabla sin acciones de edición', () => {
        login('vendedor@duoc.cl', 'vende123')
        renderWithProviders(<AdminProductos />)

        expect(filas()).toHaveLength(6)
        expect(screen.queryByRole('button', { name: '+ Nuevo producto' })).not.toBeInTheDocument()
        expect(screen.queryByRole('columnheader', { name: 'Acciones' })).not.toBeInTheDocument()
        expect(screen.queryByRole('button', { name: /^Editar/ })).not.toBeInTheDocument()
    })

    // Estado + evento: crear un producto lo agrega a la tabla y a la base
    it('crea un producto nuevo y lo muestra en la tabla', async () => {
        renderWithProviders(<AdminProductos />)

        await userEvent.click(screen.getByRole('button', { name: '+ Nuevo producto' }))
        await userEvent.type(screen.getByLabelText('Nombre'), 'Audífonos Gamer')
        await userEvent.type(screen.getByLabelText('Precio'), '30000')
        await userEvent.type(screen.getByLabelText('Stock'), '20')
        await userEvent.type(screen.getByLabelText('Stock crítico (opcional)'), '5')
        await userEvent.selectOptions(screen.getByLabelText('Categoría'), 'Gaming')
        await userEvent.click(screen.getByRole('button', { name: 'Guardar producto' }))

        expect(filas()).toHaveLength(7)
        expect(screen.getByText('Audífonos Gamer')).toBeInTheDocument()
        expect(getProducts().at(-1)).toMatchObject({ name: 'Audífonos Gamer', price: 30000, stock: 20, stockCritico: 5, category: 'Gaming' })
        expect(screen.queryByRole('button', { name: 'Guardar producto' })).not.toBeInTheDocument()
    })

    // Validación: no guarda un formulario inválido y muestra los mensajes por campo
    it('muestra errores y no guarda si el formulario es inválido', async () => {
        renderWithProviders(<AdminProductos />)

        await userEvent.click(screen.getByRole('button', { name: '+ Nuevo producto' }))
        await userEvent.type(screen.getByLabelText('Stock'), '-3')
        await userEvent.click(screen.getByRole('button', { name: 'Guardar producto' }))

        expect(screen.getByText('El nombre es obligatorio (máximo 100 caracteres)')).toBeInTheDocument()
        expect(screen.getByText('El precio debe ser 0 o mayor')).toBeInTheDocument()
        expect(screen.getByText('El stock debe ser un número entero igual o mayor a 0')).toBeInTheDocument()
        expect(screen.getByText('Debes seleccionar una categoría')).toBeInTheDocument()
        expect(getProducts()).toHaveLength(6)
    })

    // Editar + RF5: al dejar el stock bajo el umbral aparece la alerta de stock crítico
    it('edita un producto y avisa cuando su stock queda en nivel crítico', async () => {
        renderWithProviders(<AdminProductos />)

        await userEvent.click(screen.getByRole('button', { name: 'Editar Juego PS4' }))
        const stock = screen.getByLabelText('Stock')
        expect(stock).toHaveValue(8) // parte con el valor actual
        await userEvent.clear(stock)
        await userEvent.type(stock, '2')
        await userEvent.click(screen.getByRole('button', { name: 'Guardar producto' }))

        expect(getProducts().find((p) => p.name === 'Juego PS4').stock).toBe(2)
        expect(screen.getByRole('alert')).toHaveTextContent('"Juego PS4" (2) quedó igual o por debajo del stock crítico (3)')
        expect(filas()).toHaveLength(6) // editar no agrega filas
    })

    // Evento + mock de window.confirm: eliminar pide confirmación
    it('elimina un producto solo si se confirma', async () => {
        const confirmar = vi.spyOn(window, 'confirm')
        renderWithProviders(<AdminProductos />)

        confirmar.mockReturnValue(false)
        await userEvent.click(screen.getByRole('button', { name: 'Eliminar Juego PS4' }))
        expect(filas()).toHaveLength(6)

        confirmar.mockReturnValue(true)
        await userEvent.click(screen.getByRole('button', { name: 'Eliminar Juego PS4' }))
        expect(filas()).toHaveLength(5)
        expect(screen.queryByText('Juego PS4')).not.toBeInTheDocument()
        expect(getProducts()).toHaveLength(5)
    })

    // Cancelar cierra el formulario sin guardar
    it('Cancelar cierra el formulario sin crear nada', async () => {
        renderWithProviders(<AdminProductos />)

        await userEvent.click(screen.getByRole('button', { name: '+ Nuevo producto' }))
        await userEvent.type(screen.getByLabelText('Nombre'), 'Algo')
        await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

        expect(screen.queryByLabelText('Nombre')).not.toBeInTheDocument()
        expect(getProducts()).toHaveLength(6)
    })
})
