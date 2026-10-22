import { act, renderHook } from '@testing-library/react'
import { CartProvider, useCart } from './CartContext'

const teclado = { id: 3, name: 'Teclado Mecánico RGB', price: 45000, image: '/img/Teclado.webp', stock: 4 }

const renderCart = () => renderHook(() => useCart(), { wrapper: CartProvider })

describe('CartContext — control de stock', () => {
    it('addItem no agrega más unidades que el stock y avisa con false', () => {
        const { result } = renderCart()

        for (let i = 0; i < 4; i++) {
            act(() => { expect(result.current.addItem(teclado)).toBe(true) })
        }
        act(() => { expect(result.current.addItem(teclado)).toBe(false) })

        expect(result.current.items[0].quantity).toBe(4)
    })

    it('addItem no agrega productos agotados', () => {
        const { result } = renderCart()

        act(() => { expect(result.current.addItem({ ...teclado, stock: 0 })).toBe(false) })

        expect(result.current.items).toEqual([])
    })

    it('updateQuantity limita la cantidad al stock (999 queda en el máximo)', () => {
        const { result } = renderCart()
        act(() => { result.current.addItem(teclado) })

        act(() => result.current.updateQuantity(teclado.id, '999'))

        expect(result.current.items[0].quantity).toBe(4)
    })

    it('syncStock recorta cantidades y quita productos agotados o eliminados', () => {
        const { result } = renderCart()
        act(() => {
            result.current.addItem(teclado)
            result.current.addItem({ id: 2, name: 'MousePad', price: 15000, image: '', stock: 25 })
            result.current.addItem({ id: 9, name: 'Eliminado', price: 1, image: '', stock: 5 })
        })
        act(() => result.current.updateQuantity(3, 4))

        act(() => result.current.syncStock({ 3: 2, 2: 0 }))

        expect(result.current.items).toHaveLength(1)
        expect(result.current.items[0]).toMatchObject({ id: 3, quantity: 2, stock: 2 })
    })
})
