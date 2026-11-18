import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from './App';
import { initDB } from './services/db';
import { iniciarSesion } from './test/authFixtures';

it('el vendedor consulta productos y órdenes y no puede entrar a checkout ni usuarios', async () => {
    initDB();
    iniciarSesion('vendedor@duoc.cl');
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => ({
        ok: true,
        json: async () => url.endsWith('/productos')
            ? [{ id: 1, name: 'Teclado', price: 10000, stock: 3 }]
            : [{ id: 2, fecha: '2026-01-01T12:00:00', clienteNombre: 'Carla', total: 10000 }],
    }));
    const app = (ruta) => <MemoryRouter initialEntries={[ruta]}><App /></MemoryRouter>;
    const { unmount } = render(app('/checkout'));
    expect(await screen.findByRole('cell', { name: 'Teclado' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /nuevo|editar|eliminar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Usuarios' })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('link', { name: 'Órdenes' }));
    expect(await screen.findByRole('cell', { name: 'Carla' })).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(expect.stringMatching(/\/ordenes$/), expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ Authorization: 'Bearer jwt-de-prueba' }),
    }));

    unmount();
    render(app('/admin/usuarios'));
    expect(await screen.findByRole('table', { name: 'Productos' })).toBeInTheDocument();
});
