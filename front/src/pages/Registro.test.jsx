import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Routes, Route } from 'react-router-dom'
import Registro from './Registro'
import { renderWithProviders } from '../test/renderWithProviders'
import { initDB, findUserByEmail, getUsers, getSession } from '../services/db'

const renderRegistro = () =>
    renderWithProviders(
        <Routes>
            <Route path="/registro" element={<Registro />} />
            <Route path="/" element={<p>Página de inicio</p>} />
        </Routes>,
        { ruta: '/registro' }
    )

// Completa todos los campos con datos válidos; "cambios" permite sobreescribir alguno
const completar = async (cambios = {}) => {
    const datos = {
        'RUN (sin puntos ni guion)': '123456785',
        'Correo electrónico': 'maria@duoc.cl',
        Nombre: 'María José',
        Apellidos: 'Pérez Soto',
        Contraseña: 'clave1',
        'Confirmar contraseña': 'clave1',
        Dirección: 'Calle Los Alerces 456',
        ...cambios,
    }
    for (const [etiqueta, valor] of Object.entries(datos)) {
        await userEvent.type(screen.getByLabelText(etiqueta), valor)
    }
    await userEvent.selectOptions(screen.getByLabelText('Región'), 'Región del Biobío')
    await userEvent.selectOptions(screen.getByLabelText('Comuna'), 'Concepción')
}

const enviar = () => userEvent.click(screen.getByRole('button', { name: 'Registrarme' }))

describe('Registro', () => {
    beforeEach(() => initDB())

    // Prueba 74 (RF4, estado dependiente): la comuna depende de la región elegida
    it('mantiene la comuna deshabilitada hasta elegir región y luego muestra sus comunas', async () => {
        renderRegistro()
        const comuna = screen.getByLabelText('Comuna')
        expect(comuna).toBeDisabled()

        await userEvent.selectOptions(screen.getByLabelText('Región'), 'Región del Biobío')

        expect(comuna).toBeEnabled()
        expect(screen.getByRole('option', { name: 'Concepción' })).toBeInTheDocument()
        expect(screen.queryByRole('option', { name: 'Santiago' })).not.toBeInTheDocument()
    })

    // Prueba 75 (RF4): cambiar de región limpia la comuna elegida
    it('al cambiar de región se reinicia la comuna seleccionada', async () => {
        renderRegistro()
        await userEvent.selectOptions(screen.getByLabelText('Región'), 'Región del Biobío')
        await userEvent.selectOptions(screen.getByLabelText('Comuna'), 'Concepción')

        await userEvent.selectOptions(screen.getByLabelText('Región'), 'Región de Ñuble')

        expect(screen.getByLabelText('Comuna')).toHaveValue('')
    })

    // Prueba 76 (RF3, validación): formulario vacío muestra un error por campo y no crea usuario
    it('muestra errores en todos los campos si se envía vacío y no crea ningún usuario', async () => {
        renderRegistro()
        const antes = getUsers().length

        await enviar()

        expect(screen.getByText(/RUN inválido/)).toBeInTheDocument()
        expect(screen.getByText('Ingresa tu correo')).toBeInTheDocument()
        expect(screen.getByText('Selecciona una región')).toBeInTheDocument()
        expect(screen.getByText('Selecciona una comuna')).toBeInTheDocument()
        expect(getUsers()).toHaveLength(antes)
    })

    // Prueba 77 (RF3, validación): RUN con dígito verificador incorrecto
    it('rechaza un RUN con dígito verificador incorrecto', async () => {
        renderRegistro()

        await completar({ 'RUN (sin puntos ni guion)': '123456784' })
        await enviar()

        expect(screen.getByText(/RUN inválido/)).toBeInTheDocument()
        expect(findUserByEmail('maria@duoc.cl')).toBeNull()
    })

    // Prueba 78 (RF3, validación): las contraseñas deben coincidir
    it('rechaza el registro si las contraseñas no coinciden', async () => {
        renderRegistro()

        await completar({ 'Confirmar contraseña': 'otra' })
        await enviar()

        expect(screen.getByText('Las contraseñas no coinciden')).toBeInTheDocument()
        expect(findUserByEmail('maria@duoc.cl')).toBeNull()
    })

    // Prueba 79 (flujo completo): registra al cliente, inicia su sesión y vuelve al inicio
    it('con datos válidos crea un cliente, inicia sesión y navega al inicio', async () => {
        renderRegistro()

        await completar()
        await enviar()

        const creado = findUserByEmail('maria@duoc.cl')
        expect(creado).toMatchObject({ tipo: 'cliente', run: '123456785', comuna: 'Concepción' })
        expect(getSession().correo).toBe('maria@duoc.cl')
        expect(screen.getByText('Página de inicio')).toBeInTheDocument()
    })

    // Prueba 80 (correo único): un correo ya registrado se informa en el campo
    it('muestra "El correo ya está registrado" si el correo ya existe', async () => {
        renderRegistro()

        await completar({ 'Correo electrónico': 'carla@gmail.com' })
        await enviar()

        expect(screen.getByText('El correo ya está registrado')).toBeInTheDocument()
        expect(getUsers()).toHaveLength(3)
    })
})
