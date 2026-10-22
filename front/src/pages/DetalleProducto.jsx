import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProducts } from '../services/db';
import { useCart } from '../context/CartContext';

const DetalleProducto = () => {
    const { id } = useParams();
    const { addItem } = useCart();
    const [producto, setProducto] = useState(null);
    const [mensaje, setMensaje] = useState('');

    useEffect(() => {
        const productos = getProducts();
        const found = productos.find(p => p.id === parseInt(id));
        setProducto(found);
    }, [id]);

    if (!producto) return (
        <div className="container my-5 text-center">
            <h2>Producto no encontrado</h2>
            <Link to="/productos" className="btn btn-primary mt-3">Volver al catálogo</Link>
        </div>
    );

    const agotado = producto.stock <= 0;

    const handleAdd = () => {
        const agregado = addItem({
            id: producto.id,
            name: producto.name,
            price: producto.price,
            image: producto.image,
            stock: producto.stock,
        });
        setMensaje(agregado ? 'Producto agregado al carrito' : 'Ya tienes en el carrito todo el stock disponible');
    };

    return (
        <main className="container my-5">
            <div className="row align-items-center">
                <div className="col-md-6 text-center mb-4">
                    <img src={producto.image} alt={producto.name} className="img-fluid rounded shadow" style={{maxHeight: '400px'}} />
                </div>
                <div className="col-md-6">
                    <span className="badge bg-secondary mb-2">{producto.category}</span>
                    <h2 className="fw-bold">{producto.name}</h2>
                    <h3 className="text-primary fw-bold mt-3">${producto.price.toLocaleString('es-CL')}</h3>
                    <p className="text-muted mt-4">
                        Garantía oficial y calidad asegurada por Hijos de las Ventas. Stock disponible para despacho inmediato a todo Chile.
                    </p>
                    <div className="d-grid gap-2 mt-4">
                        <button type="button" className="btn btn-success btn-lg fw-bold" onClick={handleAdd} disabled={agotado}>
                            {agotado ? 'Agotado' : '🛒 Añadir al Carrito'}
                        </button>
                        {mensaje && <p className="small text-muted mb-0" role="status">{mensaje}</p>}
                        <Link to="/productos" className="btn btn-outline-secondary">Volver al catálogo</Link>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default DetalleProducto;