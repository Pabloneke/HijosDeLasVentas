import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const formatPrice = (value) => new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
}).format(value);

const initialCustomer = {
    name: '',
    email: '',
    address: '',
};

const Checkout = () => {
    const { items, total } = useCart();
    const [customer, setCustomer] = useState(initialCustomer);
    const [errors, setErrors] = useState({});
    const [confirmed, setConfirmed] = useState(false);

    if (items.length === 0) {
        return <Navigate to="/carrito" replace />;
    }

    const validateCustomer = () => {
        const nextErrors = {};
        const trimmedName = customer.name.trim();
        const trimmedEmail = customer.email.trim();
        const trimmedAddress = customer.address.trim();

        if (!trimmedName || trimmedName.length < 2) {
            nextErrors.name = 'Ingresa tu nombre completo.';
        }
        if (!trimmedEmail) {
            nextErrors.email = 'Ingresa tu correo electrónico.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            nextErrors.email = 'Ingresa un correo electrónico válido.';
        }
        if (!trimmedAddress || trimmedAddress.length < 5) {
            nextErrors.address = 'Ingresa una dirección de envío válida.';
        }

        return nextErrors;
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setCustomer((currentCustomer) => ({ ...currentCustomer, [name]: value }));
        setErrors((currentErrors) => ({ ...currentErrors, [name]: '' }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        const nextErrors = validateCustomer();
        setErrors(nextErrors);

        if (Object.keys(nextErrors).length === 0) {
            setConfirmed(true);
        }
    };

    if (confirmed) {
        return (
            <main className="container my-5">
                <section className="checkout-confirmation card shadow-sm border-0 mx-auto text-center">
                    <div className="card-body p-4 p-md-5">
                        <div className="checkout-confirmation-icon mb-3" aria-hidden="true">✓</div>
                        <h1 className="h2">Pedido registrado para demostración</h1>
                        <p className="text-muted">
                            Recibimos los datos de tu pedido, {customer.name.trim()}. Se ha enviado una copia a tu correo electrónico, {customer.email}.
                        </p>
                        <p className="mb-4">
                            Total de referencia: <strong>{formatPrice(total)}</strong>
                        </p>
                        <Link to="/productos" className="btn btn-primary">
                            Volver a productos
                        </Link>
                    </div>
                </section>
            </main>
        );
    }

    return (
        <main className="container my-5">
            <h1 className="mb-4">Finalizar compra</h1>
            <div className="row g-4">
                <section className="col-lg-7">
                    <div className="card shadow-sm border-0">
                        <div className="card-body p-4">
                            <h2 className="h4 mb-4">Datos de entrega</h2>
                            <form onSubmit={handleSubmit} noValidate>
                                <div className="mb-3">
                                    <label htmlFor="checkout-name" className="form-label">Nombre completo</label>
                                    <input
                                        id="checkout-name"
                                        name="name"
                                        type="text"
                                        className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                        value={customer.name}
                                        onChange={handleChange}
                                        autoComplete="name"
                                    />
                                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="checkout-email" className="form-label">Correo electrónico</label>
                                    <input
                                        id="checkout-email"
                                        name="email"
                                        type="email"
                                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                        value={customer.email}
                                        onChange={handleChange}
                                        autoComplete="email"
                                    />
                                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                                </div>
                                <div className="mb-4">
                                    <label htmlFor="checkout-address" className="form-label">Dirección de envío</label>
                                    <textarea
                                        id="checkout-address"
                                        name="address"
                                        rows="3"
                                        className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                                        value={customer.address}
                                        onChange={handleChange}
                                        autoComplete="street-address"
                                    />
                                    {errors.address && <div className="invalid-feedback">{errors.address}</div>}
                                </div>
                                <button type="submit" className="btn btn-success w-100">
                                    Confirmar pedido de demostración
                                </button>
                            </form>
                        </div>
                    </div>
                </section>

                <aside className="col-lg-5">
                    <div className="card shadow-sm border-0">
                        <div className="card-body p-4">
                            <h2 className="h4 mb-3">Resumen del pedido</h2>
                            <div className="checkout-order-items">
                                {items.map((item) => (
                                    <div className="d-flex align-items-center gap-3 border-bottom py-3" key={item.id}>
                                        <img src={item.image} alt={item.name} className="checkout-item-image rounded" />
                                        <div className="flex-grow-1">
                                            <h3 className="h6 mb-1">{item.name}</h3>
                                            <p className="small text-muted mb-0">
                                                {item.quantity} x {formatPrice(item.price)}
                                            </p>
                                        </div>
                                        <strong>{formatPrice(item.price * item.quantity)}</strong>
                                    </div>
                                ))}
                            </div>
                            <div className="d-flex justify-content-between pt-3">
                                <span className="h5 mb-0">Total</span>
                                <strong className="h5 mb-0">{formatPrice(total)}</strong>
                            </div>
                            <Link to="/carrito" className="btn btn-outline-secondary w-100 mt-3">
                                Volver al carrito
                            </Link>
                        </div>
                    </div>
                </aside>
            </div>
        </main>
    );
};

export default Checkout;
