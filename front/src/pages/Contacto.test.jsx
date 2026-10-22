import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Contacto from './Contacto'
import { CartProvider } from '../context/CartContext'

describe('Contacto', () => {
    // Prueba 10 (estado): al escribir, el estado del formulario cambia y el input refleja el texto
    it('actualiza el valor de los campos cuando el usuario escribe', async () => {
        render(<CartProvider><Contacto /></CartProvider>)
        const nombre = screen.getByLabelText('Nombre completo')
        const email = screen.getByLabelText('Correo electrónico')
        const mensaje = screen.getByLabelText('Mensaje')

        // Parten vacíos (valor inicial del estado)
        expect(nombre).toHaveValue('')

        await userEvent.type(nombre, 'Branco Aliaga')
        await userEvent.type(email, 'branco@duoc.cl')
        await userEvent.type(mensaje, 'Hola, quiero cotizar')

        expect(nombre).toHaveValue('Branco Aliaga')
        expect(email).toHaveValue('branco@duoc.cl')
        expect(mensaje).toHaveValue('Hola, quiero cotizar')
    })
})
