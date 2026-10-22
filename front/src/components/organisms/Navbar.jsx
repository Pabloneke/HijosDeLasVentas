import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const Navbar = () => {
    const location = useLocation();
    const { totalItems, cartTargetRef } = useCart();

    // Funcion para saber si el link esta activo 
    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <header>
            {/* Barra de navegacion principal (Bootstrap 5.3) */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-primary justify-content-center position-relative">
                <div className="container">
                    <Link to="/" className="navbar-brand position-absolute start-0 top-50 translate-middle-y me-3">
                        <img src="/img/logo.png" alt="Logo Hijos de las Ventas" style={{ height: '80px' }} />
                    </Link>

                    {/* Boton hamburguesa */}
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    {/* Enlaces de navegacion */}
                    <div className="collapse navbar-collapse justify-content-center" id="navbarNav">
                        <ul className="navbar-nav">
                            <li className="nav-item mx-3">
                                <Link className={`nav-link text-white fw-bold ${isActive('/')}`} to="/">Inicio</Link>
                            </li>
                            <li className="nav-item mx-3">
                                <Link className={`nav-link text-white fw-bold ${isActive('/productos')}`} to="/productos">Productos</Link>
                            </li>
                            <li className="nav-item mx-3">
                                <Link className={`nav-link text-white fw-bold ${isActive('/ofertas')}`} to="/ofertas">Ofertas</Link>
                            </li>
                            <li className="nav-item mx-3">
                                <Link className={`nav-link text-white fw-bold ${isActive('/nosotros')}`} to="/nosotros">Nosotros</Link>
                            </li>
                            <li className="nav-item mx-3">
                                <Link className={`nav-link text-white fw-bold ${isActive('/blogs')}`} to="/blogs">Blog</Link>
                            </li>
                            <li className="nav-item mx-3">
                                <Link className={`nav-link text-white fw-bold ${isActive('/contacto')}`} to="/contacto">Contacto</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Botones de accion derecha (Carrito y Login) */}
                    <div className="d-flex position-absolute end-0 top-50 translate-middle-y me-3">
                        <Link
                            to="/carrito"
                            className="btn btn-success fw-bold me-2 navbar-cart-link"
                            aria-label={`Abrir carrito, ${totalItems} ${totalItems === 1 ? 'producto' : 'productos'}`}
                        >
                            <span ref={cartTargetRef} className="navbar-cart-icon" aria-hidden="true">
                                <svg viewBox="0 0 24 24" role="img" focusable="false">
                                    <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 1.9-1.4L21 8H6" />
                                    <circle cx="10" cy="20" r="1.2" />
                                    <circle cx="18" cy="20" r="1.2" />
                                </svg>
                            </span>
                            <span>Carrito</span>
                            <span className="navbar-cart-badge" aria-live="polite">{totalItems}</span>
                        </Link>
                        <Link to="/login" className="btn btn-outline-light fw-bold me-2">Iniciar Sesion</Link>
                        <Link to="/registro" className="btn btn-primary fw-bold border-light">Crear Cuenta</Link>
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Navbar;