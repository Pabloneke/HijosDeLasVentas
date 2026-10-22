import { formatPrice } from './precios'

describe('formatPrice', () => {
    // Lógica: el valor esperado se calcula con el mismo Intl, así la prueba no depende
    // del tipo de espacio o separador que use cada sistema.
    it('formatea en pesos chilenos sin decimales', () => {
        const esperado = new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            maximumFractionDigits: 0,
        }).format(65000)

        expect(formatPrice(65000)).toBe(esperado)
        expect(formatPrice(65000)).toContain('65.000')
        expect(formatPrice(0)).toContain('0')
    })
})
