import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const formatPrice = (value) => new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
}).format(value);

const Carrito = () => {
    const { items, total, updateQuantity, removeItem, clearCart } = useCart();

    return (
        <main className="container my-5">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                <h2 className="mb-0">Carrito de compras</h2>
                {items.length > 0 && (
                    <button type="button" className="btn btn-outline-danger" onClick={clearCart}>
                        Vaciar carrito
                    </button>
                )}
            </div>

            {items.length === 0 ? (
                <section className="text-center py-5">
                    <p className="lead text-muted">Tu carrito está vacío.</p>
                    <Link to="/productos" className="btn btn-primary fw-bold">Ver productos</Link>
                </section>
            ) : (
                <section className="row g-4">
                    <div className="col-lg-8">
                        <div className="list-group shadow-sm">
                            {items.map((item) => (
                                <article key={item.id} className="list-group-item p-3">
                                    <div className="row align-items-center g-3">
                                        <div className="col-3 col-md-2">
                                            <img src={item.image} alt={item.name} className="img-fluid rounded cart-item-image" />
                                        </div>
                                        <div className="col-9 col-md-4">
                                            <h5 className="mb-1">{item.name}</h5>
                                            <span className="text-muted">{formatPrice(item.price)} c/u</span>
                                        </div>
                                        <div className="col-7 col-md-3">
                                            <label className="form-label visually-hidden" htmlFor={`quantity-${item.id}`}>Cantidad</label>
                                            <input
                                                id={`quantity-${item.id}`}
                                                className="form-control"
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(event) => updateQuantity(item.id, event.target.value)}
                                            />
                                        </div>
                                        <div className="col-5 col-md-3 text-end">
                                            <strong>{formatPrice(item.price * item.quantity)}</strong>
                                            <button type="button" className="btn btn-link text-danger d-block ms-auto p-0" onClick={() => removeItem(item.id)}>
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                    <aside className="col-lg-4">
                        <div className="card border-0 shadow-sm p-4">
                            <h3 className="h5">Resumen del pedido</h3>
                            <div className="d-flex justify-content-between border-top pt-3 mt-2">
                                <span>Total</span>
                                <strong>{formatPrice(total)}</strong>
                            </div>
                            <Link to="/checkout" className="btn btn-success w-100 mt-4">Continuar al pago</Link>
                        </div>
                    </aside>
                </section>
            )}
        </main>
    );
};

export default Carrito;
