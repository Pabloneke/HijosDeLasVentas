import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import FormField from './FormField'

describe('FormField', () => {
    // Prueba 66 (render + props): la etiqueta queda asociada al control y recibe sus props
    it('asocia la etiqueta al control y le pasa las props recibidas', () => {
        render(<FormField id="nombre" label="Nombre" placeholder="Ej: Ana" maxLength={20} onChange={() => {}} value="" />)

        const campo = screen.getByLabelText('Nombre')
        expect(campo).toHaveAttribute('placeholder', 'Ej: Ana')
        expect(campo).toHaveAttribute('maxlength', '20')
        expect(campo).toHaveClass('form-control')
        expect(campo).not.toHaveAttribute('aria-invalid')
    })

    // Prueba 67 (render condicional): con error se marca inválido y se muestra el mensaje
    it('muestra el mensaje y marca el campo como inválido cuando recibe un error', () => {
        render(<FormField id="correo" label="Correo" error="Correo inválido" onChange={() => {}} value="" />)

        const campo = screen.getByLabelText('Correo')
        expect(campo).toHaveClass('is-invalid')
        expect(campo).toHaveAttribute('aria-invalid', 'true')
        expect(screen.getByText('Correo inválido')).toBeInTheDocument()
        expect(campo).toHaveAccessibleDescription('Correo inválido')
    })

    // Prueba 68 (as="select"): usa la clase de Bootstrap para selects y muestra sus opciones
    it('con as="select" renderiza un select con sus opciones', async () => {
        const Ejemplo = () => {
            const [valor, setValor] = useState('')
            return (
                <FormField id="region" label="Región" as="select" value={valor} onChange={(e) => setValor(e.target.value)}>
                    <option value="">-- elige --</option>
                    <option value="sur">Sur</option>
                </FormField>
            )
        }
        render(<Ejemplo />)

        const select = screen.getByLabelText('Región')
        expect(select).toHaveClass('form-select')

        await userEvent.selectOptions(select, 'sur')
        expect(select).toHaveValue('sur')
    })
})
