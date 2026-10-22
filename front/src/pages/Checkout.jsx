import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormField from '../components/atoms/FormField';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Boleta from '../components/organisms/Boleta';
import { procesarCompra } from '../services/db';
import { numeroBoleta } from '../utils/boleta';
import { validarCheckout } from '../utils/validaciones';
import { REGIONES } from '../utils/regiones';

const initialForm = {
    nombre: '',
    correo: '',
    entrega: 'despacho',
    region: '',
    comuna: '',
    direccion: '',
    titular: '',
    tarjeta: '',
    vencimiento: '',
    cvv: '',
};

const formatPrice = (value) => new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
}).format(value);

const Checkout = () => {
    const { user } = useAuth();
    const { items, total, clearCart } = useCart();
    const navigate = useNavigate();
    const [form, setForm] = useState(() => ({
        ...initialForm,
        nombre: user?.nombre || '',
        correo: user?.correo || '',
    }));
    const [errores, setErrores] = useState({});
    const [confirmado, setConfirmado] = useState(false);
    const [ordenConfirmada, setOrdenConfirmada] = useState(null);
    const [verBoleta, setVerBoleta] = useState(false);
    const [errorCompra, setErrorCompra] = useState('');

    const handleChange = (event) => {
        const { id, value } = event.target;
        setForm((current) => ({
            ...current,
            [id]: value,
            ...(id === 'region' ? { comuna: '' } : {}),
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const nuevosErrores = validarCheckout(form);
        setErrores(nuevosErrores);
        if (Object.keys(nuevosErrores).length > 0) return;

        // Revalida el stock contra el mantenedor, lo descuenta y registra la orden
        try {
            const entrega = form.entrega === 'retiro'
                ? { modalidad: 'retiro' }
                : { modalidad: 'despacho', region: form.region, comuna: form.comuna, direccion: form.direccion };
            const orden = procesarCompra(items, {
                userId: user?.id ?? null,
                nombre: form.nombre,
                correo: form.correo,
            }, entrega);
            setOrdenConfirmada(orden);
            setErrorCompra('');
            setConfirmado(true);
            clearCart();
        } catch (error) {
            setErrorCompra(error.message);
        }
    };

    if (items.length === 0 && !confirmado) {
        return (
            <main className="container my-5">
                <section className="text-center py-5">
                    <h2 className="mb-3">No puedes continuar todavía</h2>
                    <p className="lead text-muted">Agrega al menos un producto al carrito para iniciar el checkout.</p>
                    <div className="d-flex justify-content-center gap-2 flex-wrap">
                        <Link to="/carrito" className="btn btn-outline-primary">Ver carrito</Link>
                        <Link to="/productos" className="btn btn-primary">Ver productos</Link>
                    </div>
                </section>
            </main>
        );
    }

    if (confirmado && ordenConfirmada) {
        return (
            <main className="container my-5">
                <section className="card border-0 shadow-sm p-4 p-md-5 text-center checkout-confirmation">
                    <div className="display-5 text-success mb-3" aria-hidden="true">✓</div>
                    <h2 className="mb-3">Solicitud de compra registrada</h2>
                    <p className="lead">
                        Tu pedido <strong>{numeroBoleta(ordenConfirmada)}</strong> quedó preparado correctamente.
                    </p>
                    <p className="text-muted mb-4">
                        Se envio una copia a {form.correo}. No se realizó ningún cobro (compra de demostración).
                    </p>
                    <div className="d-flex justify-content-center gap-2 flex-wrap no-print">
                        <button type="button" className="btn btn-success fw-bold" onClick={() => setVerBoleta((v) => !v)} aria-expanded={verBoleta}>
                            {verBoleta ? 'Ocultar boleta' : 'Ver boleta'}
                        </button>
                        {verBoleta && (
                            <button type="button" className="btn btn-outline-success fw-bold" onClick={() => window.print()}>
                                Imprimir / Guardar PDF
                            </button>
                        )}
                        <Link to="/carrito" className="btn btn-outline-primary">Volver al carrito</Link>
                        <Link to="/productos" className="btn btn-primary">Seguir comprando</Link>
                    </div>
                    {verBoleta && (
                        <div className="boleta-wrapper mt-4">
                            <Boleta orden={ordenConfirmada} />
                        </div>
                    )}
                </section>
            </main>
        );
    }

    const comunas = REGIONES[form.region] || [];

    return (
        <main className="container my-5">
            <h2 className="mb-4">Finalizar compra</h2>
            <div className="row g-4">
                <section className="col-lg-7">
                    <div className="card border-0 shadow-sm p-4">
                        <h3 className="h5 mb-4">Datos de contacto y entrega</h3>
                        {errorCompra && (
                            <div className="alert alert-danger" role="alert">
                                {errorCompra}. <Link to="/carrito" className="alert-link">Ajusta tu carrito</Link> e inténtalo de nuevo.
                            </div>
                        )}
                        <form onSubmit={handleSubmit} noValidate>
                            <FormField
                                id="nombre"
                                label="Nombre completo"
                                value={form.nombre}
                                onChange={handleChange}
                                error={errores.nombre}
                                autoComplete="name"
                            />
                            <FormField
                                id="correo"
                                label="Correo electrónico"
                                type="email"
                                value={form.correo}
                                onChange={handleChange}
                                error={errores.correo}
                                autoComplete="email"
                            />
                            <FormField id="entrega" label="Modalidad de entrega" as="select" value={form.entrega} onChange={handleChange}>
                                <option value="despacho">Despacho a domicilio</option>
                                <option value="retiro">Retiro coordinado</option>
                            </FormField>

                            {form.entrega === 'despacho' && (
                                <>
                                    <FormField id="region" label="Región" as="select" value={form.region} onChange={handleChange} error={errores.region}>
                                        <option value="">-- Seleccione la región --</option>
                                        {Object.keys(REGIONES).map((region) => (
                                            <option key={region} value={region}>{region}</option>
                                        ))}
                                    </FormField>
                                    <FormField id="comuna" label="Comuna" as="select" disabled={comunas.length === 0} value={form.comuna} onChange={handleChange} error={errores.comuna}>
                                        <option value="">-- Seleccione la comuna --</option>
                                        {comunas.map((comuna) => <option key={comuna} value={comuna}>{comuna}</option>)}
                                    </FormField>
                                    <FormField id="direccion" label="Dirección de despacho" value={form.direccion} onChange={handleChange} error={errores.direccion} autoComplete="street-address" />
                                </>
                            )}

                            <fieldset className="checkout-payment mt-4">
                                <legend className="h5 mb-3">Datos de pago</legend>
                                <p className="small text-muted">
                                    Completa estos datos para revisar el pago de demostración. No se realizará ningún cobro.
                                </p>
                                <FormField
                                    id="titular"
                                    label="Nombre del titular"
                                    value={form.titular}
                                    onChange={handleChange}
                                    error={errores.titular}
                                    autoComplete="cc-name"
                                />
                                <FormField
                                    id="tarjeta"
                                    label="Número de tarjeta"
                                    value={form.tarjeta}
                                    onChange={handleChange}
                                    error={errores.tarjeta}
                                    autoComplete="cc-number"
                                    inputMode="numeric"
                                    maxLength={19}
                                    placeholder="4111 1111 1111 1111"
                                />
                                <div className="row">
                                    <div className="col-sm-6">
                                        <FormField
                                            id="vencimiento"
                                            label="Vencimiento (MM/AA)"
                                            value={form.vencimiento}
                                            onChange={handleChange}
                                            error={errores.vencimiento}
                                            autoComplete="cc-exp"
                                            inputMode="numeric"
                                            maxLength={5}
                                            placeholder="12/30"
                                        />
                                    </div>
                                    <div className="col-sm-6">
                                        <FormField
                                            id="cvv"
                                            label="CVV"
                                            type="password"
                                            value={form.cvv}
                                            onChange={handleChange}
                                            error={errores.cvv}
                                            autoComplete="cc-csc"
                                            inputMode="numeric"
                                            maxLength={4}
                                            placeholder="123"
                                        />
                                    </div>
                                </div>
                            </fieldset>

                            <p className="small text-muted">
                                Checkout de demostración: tus datos de pago se validan solo en este navegador y no se almacenan ni se envían.
                            </p>
                            <button type="submit" className="btn btn-success w-100 fw-bold">Revisar y confirmar pedido</button>
                        </form>
                    </div>
                </section>

                <aside className="col-lg-5">
                    <div className="card border-0 shadow-sm p-4">
                        <h3 className="h5 mb-3">Resumen del pedido</h3>
                        <div className="checkout-summary-list">
                            {items.map((item) => (
                                <div key={item.id} className="d-flex gap-3 align-items-center border-bottom py-3">
                                    <img src={item.image} alt={item.name} className="checkout-item-image rounded" />
                                    <div className="flex-grow-1">
                                        <h4 className="h6 mb-1">{item.name}</h4>
                                        <div className="small text-muted">
                                            {item.quantity} x {formatPrice(item.price)}
                                        </div>
                                    </div>
                                    <strong>{formatPrice(item.price * item.quantity)}</strong>
                                </div>
                            ))}
                        </div>
                        <div className="d-flex justify-content-between border-top pt-3 mt-2">
                            <span className="fw-bold">Total</span>
                            <strong>{formatPrice(total)}</strong>
                        </div>
                        <button type="button" className="btn btn-link px-0 mt-3" onClick={() => navigate('/carrito')}>
                            Editar carrito
                        </button>
                    </div>
                </aside>
            </div>
        </main>
    );
};

export default Checkout;
