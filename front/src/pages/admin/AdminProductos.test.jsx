import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AdminProductos from './AdminProductos'
import { renderWithProviders } from '../../test/renderWithProviders'
import { initDB, login } from '../../services/db'
import { api } from '../../services/api'

vi.mock('../../services/api', async (importOriginal) => ({
    ...(await importOriginal()),
    api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

const categorias = [
    { id: 1, nombre: 'Computación' },
    { id: 2, nombre: 'Gaming' },
    { id: 3, nombre: 'Librería' },
    { id: 4, nombre: 'Perfumería' },
]

// Productos como los devuelve el backend: la categoría es un objeto {id, nombre}
const productosApi = [
    { id: 1, name: 'Perfume Rasasi Hawas', price: 65000, stock: 12, stockCritico: 3, category: categorias[3] },
    { id: 2, name: 'MousePad XXL Gamer', price: 15000, stock: 25, stockCritico: 5, category: categorias[0] },
    { id: 3, name: 'Teclado Mecánico RGB', price: 45000, stock: 4, stockCritico: 5, category: categorias[0] },
    { id: 4, name: 'Juego PS4', price: 20000, stock: 8, stockCritico: 3, category: categorias[1] },
    { id: 5, name: 'GTA VI (Pre-venta)', price: 70000, stock: 50, stockCritico: 10, category: categorias[1] },
    { id: 6, name: 'Manga Dorohedoro Vol. 1', price: 12000, stock: 2, stockCritico: 2, category: categorias[2] },
]

const filas = () => within(screen.getByRole('table', { name: 'Productos' })).getAllByRole('row').slice(1)
const esperarTabla = () => screen.findByRole('table', { name: 'Productos' })

describe('AdminProductos', () => {
    beforeEach(() => {
        initDB() // solo para la sesión: los datos ya vienen de la API
        login('admin@duoc.cl', 'admin123')
        api.get.mockImplementation(async (ruta) => (ruta === '/categorias' ? categorias : productosApi))
    })

    // Render de lista: una fila por producto que devuelve GET /productos
    it('lista todos los productos con su precio, stock y categoría', async () => {
        renderWithProviders(<AdminProductos />)
        await esperarTabla()

        expect(filas()).toHaveLength(6)
        expect(within(filas()[0]).getByText('Perfume Rasasi Hawas')).toBeInTheDocument()
        expect(within(filas()[0]).getByText('Perfumería')).toBeInTheDocument()
    })

    // Render condicional por rol: el vendedor consulta, pero no puede crear, editar ni eliminar
    it('el vendedor ve la tabla sin acciones de edición', async () => {
        login('vendedor@duoc.cl', 'vende123')
        renderWithProviders(<AdminProductos />)
        await esperarTabla()

        expect(filas()).toHaveLength(6)
        expect(screen.queryByRole('button', { name: '+ Nuevo producto' })).not.toBeInTheDocument()
        expect(screen.queryByRole('columnheader', { name: 'Acciones' })).not.toBeInTheDocument()
        expect(screen.queryByRole('button', { name: /^Editar/ })).not.toBeInTheDocument()
    })

    // Estado + evento: crear un producto hace POST /productos y lo agrega a la tabla
    it('crea un producto nuevo con POST /productos y lo muestra en la tabla', async () => {
        api.post.mockResolvedValue({ id: 7, name: 'Audífonos Gamer', price: 30000, stock: 20, stockCritico: 5, category: categorias[1] })
        renderWithProviders(<AdminProductos />)
        await esperarTabla()

        await userEvent.click(screen.getByRole('button', { name: '+ Nuevo producto' }))
        await userEvent.type(screen.getByLabelText('Nombre'), 'Audífonos Gamer')
        await userEvent.type(screen.getByLabelText('Precio'), '30000')
        await userEvent.type(screen.getByLabelText('Stock'), '20')
        await userEvent.type(screen.getByLabelText('Stock crítico (opcional)'), '5')
        await userEvent.selectOptions(screen.getByLabelText('Categoría'), 'Gaming')
        await userEvent.click(screen.getByRole('button', { name: 'Guardar producto' }))

        expect(await screen.findByText('Audífonos Gamer')).toBeInTheDocument()
        expect(api.post).toHaveBeenCalledWith('/productos', {
            name: 'Audífonos Gamer', price: 30000, stock: 20, stockCritico: 5, category: { id: 2 }, image: '/img/logo.png',
        })
        expect(filas()).toHaveLength(7)
        expect(screen.queryByRole('button', { name: 'Guardar producto' })).not.toBeInTheDocument()
    })

    // Validación: no guarda un formulario inválido y muestra los mensajes por campo
    it('muestra errores y no llama a la API si el formulario es inválido', async () => {
        renderWithProviders(<AdminProductos />)
        await esperarTabla()

        await userEvent.click(screen.getByRole('button', { name: '+ Nuevo producto' }))
        await userEvent.type(screen.getByLabelText('Stock'), '-3')
        await userEvent.click(screen.getByRole('button', { name: 'Guardar producto' }))

        expect(screen.getByText('El nombre es obligatorio (máximo 100 caracteres)')).toBeInTheDocument()
        expect(screen.getByText('El precio debe ser 0 o mayor')).toBeInTheDocument()
        expect(screen.getByText('El stock debe ser un número entero igual o mayor a 0')).toBeInTheDocument()
        expect(screen.getByText('Debes seleccionar una categoría')).toBeInTheDocument()
        expect(api.post).not.toHaveBeenCalled()
    })

    // Editar + RF5: al dejar el stock bajo el umbral aparece la alerta de stock crítico
    it('edita un producto con PUT y avisa cuando su stock queda en nivel crítico', async () => {
        api.put.mockImplementation(async (ruta, body) => ({ ...body, category: categorias[1] }))
        renderWithProviders(<AdminProductos />)
        await esperarTabla()

        await userEvent.click(screen.getByRole('button', { name: 'Editar Juego PS4' }))
        const stock = screen.getByLabelText('Stock')
        expect(stock).toHaveValue(8) // parte con el valor actual
        await userEvent.clear(stock)
        await userEvent.type(stock, '2')
        await userEvent.click(screen.getByRole('button', { name: 'Guardar producto' }))

        expect(await screen.findByRole('alert')).toHaveTextContent('"Juego PS4" (2) quedó igual o por debajo del stock crítico (3)')
        expect(api.put).toHaveBeenCalledWith('/productos/4', expect.objectContaining({ id: 4, stock: 2, category: { id: 2 } }))
        expect(filas()).toHaveLength(6) // editar no agrega filas
    })

    // Evento + mock de window.confirm: eliminar pide confirmación
    it('elimina un producto con DELETE solo si se confirma', async () => {
        api.delete.mockResolvedValue(null)
        const confirmar = vi.spyOn(window, 'confirm')
        renderWithProviders(<AdminProductos />)
        await esperarTabla()

        confirmar.mockReturnValue(false)
        await userEvent.click(screen.getByRole('button', { name: 'Eliminar Juego PS4' }))
        expect(filas()).toHaveLength(6)
        expect(api.delete).not.toHaveBeenCalled()

        confirmar.mockReturnValue(true)
        await userEvent.click(screen.getByRole('button', { name: 'Eliminar Juego PS4' }))
        await waitFor(() => expect(filas()).toHaveLength(5))
        expect(api.delete).toHaveBeenCalledWith('/productos/4')
        expect(screen.queryByText('Juego PS4')).not.toBeInTheDocument()
    })

    // Cancelar cierra el formulario sin guardar
    it('Cancelar cierra el formulario sin crear nada', async () => {
        renderWithProviders(<AdminProductos />)
        await esperarTabla()

        await userEvent.click(screen.getByRole('button', { name: '+ Nuevo producto' }))
        await userEvent.type(screen.getByLabelText('Nombre'), 'Algo')
        await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

        expect(screen.queryByLabelText('Nombre')).not.toBeInTheDocument()
        expect(api.post).not.toHaveBeenCalled()
        expect(filas()).toHaveLength(6)
    })
})
