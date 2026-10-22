import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProductCard from './ProductCard'

// Producto de ejemplo que se pasa por props a la tarjeta
const producto = {
    id: 1,
    name: 'Perfume Rasasi Hawas',
    price: 65000,
    category: 'Perfumería',
    image: '/img/RasasiHawas.webp',
}

describe('ProductCard', () => {
    // Prueba 1 (render): la tarjeta muestra los datos que recibe
    it('muestra el nombre, la categoría y la imagen con su alt', () => {
        render(<ProductCard {...producto} onAddToCart={() => {}} />)

        expect(screen.getByRole('heading', { name: producto.name })).toBeInTheDocument()
        expect(screen.getByText(producto.category)).toBeInTheDocument()
        expect(screen.getByAltText(producto.name)).toBeInTheDocument()
    })

    // Prueba 2 (props): la imagen usa exactamente la ruta que llega por props
    it('usa la prop image como src de la imagen', () => {
        render(<ProductCard {...producto} onAddToCart={() => {}} />)

        expect(screen.getByAltText(producto.name)).toHaveAttribute('src', producto.image)
    })

    // Prueba 3 (lógica): el precio se muestra formateado en pesos chilenos.
    // El valor esperado se calcula con el mismo Intl que usa el componente,
    // así la prueba no depende del tipo de espacio/separador que use cada sistema.
    it('muestra el precio formateado en CLP', () => {
        render(<ProductCard {...producto} onAddToCart={() => {}} />)

        const esperado = new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            maximumFractionDigits: 0,
        }).format(producto.price)

        expect(screen.getByText(esperado)).toBeInTheDocument()
    })

    // Prueba 4 (evento + spy): el clic ejecuta la función recibida por props
    it('llama a onAddToCart con los datos del producto al hacer clic en "Lo quiero"', async () => {
        const onAddToCart = vi.fn() // spy: registra cómo se llamó
        render(<ProductCard {...producto} onAddToCart={onAddToCart} />)

        await userEvent.click(screen.getByRole('button', { name: 'Lo quiero' }))

        expect(onAddToCart).toHaveBeenCalledTimes(1)
        expect(onAddToCart).toHaveBeenCalledWith({
            id: producto.id,
            name: producto.name,
            price: producto.price,
            image: producto.image,
        })
    })

    // Stock: un producto sin unidades no se puede agregar
    it('deshabilita el botón y muestra "Agotado" cuando no hay stock', () => {
        render(<ProductCard {...producto} stock={0} onAddToCart={() => {}} />)

        expect(screen.getByRole('button', { name: 'Agotado' })).toBeDisabled()
    })

    it('avisa cuando el carrito rechaza la unidad por falta de stock', async () => {
        render(<ProductCard {...producto} stock={2} onAddToCart={() => false} />)

        await userEvent.click(screen.getByRole('button', { name: 'Lo quiero' }))

        expect(screen.getByRole('button', { name: 'Sin más stock' })).toBeInTheDocument()
    })
})
