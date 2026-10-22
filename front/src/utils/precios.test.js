import { desglosarIva, formatPrice } from './precios'

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

describe('desglosarIva', () => {
    it('separa un total con IVA incluido en neto e IVA del 19%', () => {
        expect(desglosarIva(119000)).toEqual({ neto: 100000, iva: 19000, total: 119000 })
    })

    it('neto + iva siempre suma exactamente el total (aunque haya redondeo)', () => {
        const { neto, iva, total } = desglosarIva(65000)

        expect(total).toBe(65000)
        expect(neto + iva).toBe(65000)
        expect(neto).toBe(54622)
    })

    it('devuelve ceros con un total vacío o inválido', () => {
        expect(desglosarIva(0)).toEqual({ neto: 0, iva: 0, total: 0 })
        expect(desglosarIva(undefined)).toEqual({ neto: 0, iva: 0, total: 0 })
    })
})
