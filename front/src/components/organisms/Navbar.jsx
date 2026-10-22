import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
    const location = useLocation();

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
                                <Link className={`nav-link text-white fw-bold ${isActive('/categorias')}`} to="/categorias">Categorías</Link>
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
                        <Link to="/carrito" className="btn btn-success fw-bold me-2">
                            🛒 Carrito <span className="badge bg-light text-dark ms-1">$0</span>
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