import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const formatPrice = (value) => new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
}).format(value);

const Carrito = () => {
    const { items, total, updateQuantity, removeFromCart, clearCart } = useCart();

    return (
        <main className="container my-5">
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
                <h1 className="mb-0">Carrito de compras</h1>
                {items.length > 0 && (
                    <button type="button" className="btn btn-outline-danger" onClick={clearCart}>
                        Vaciar carrito
                    </button>
                )}
            </div>

            {items.length === 0 ? (
                <div className="text-center py-5">
                    <p className="lead text-muted">Tu carrito está vacío.</p>
                </div>
            ) : (
                <div className="row g-4">
                    <section className="col-lg-8">
                        <div className="list-group shadow-sm">
                            {items.map((item) => (
                                <article className="list-group-item p-3" key={item.id}>
                                    <div className="d-flex align-items-center gap-3">
                                        <img src={item.image} alt={item.name} className="cart-item-image rounded" />
                                        <div className="flex-grow-1">
                                            <h2 className="h5 mb-1">{item.name}</h2>
                                            <p className="mb-2 text-muted">{formatPrice(item.price)} cada uno</p>
                                            <div className="d-flex align-items-center gap-2">
                                                <label htmlFor={`quantity-${item.id}`} className="small">Cantidad</label>
                                                <input
                                                    id={`quantity-${item.id}`}
                                                    className="form-control form-control-sm cart-quantity"
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={(event) => updateQuantity(item.id, event.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="text-end">
                                            <strong>{formatPrice(item.price * item.quantity)}</strong>
                                            <button
                                                type="button"
                                                className="btn btn-link btn-sm text-danger d-block ms-auto"
                                                onClick={() => removeFromCart(item.id)}
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                    <aside className="col-lg-4">
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <h2 className="h4">Resumen</h2>
                                <div className="d-flex justify-content-between border-top pt-3">
                                    <span>Total</span>
                                    <strong>{formatPrice(total)}</strong>
                                </div>
                                <Link to="/checkout" className="btn btn-primary w-100 mt-3">
                                    Continuar al checkout
                                </Link>
                            </div>
                        </div>
                    </aside>
                </div>
            )}
        </main>
    );
};

export default Carrito;
