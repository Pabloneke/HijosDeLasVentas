import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <nav className="navbar navbar-expand-xl navbar-dark bg-primary px-3">
      <div className="container-fluid">
        <Link className="navbar-brand d-flex align-items-center" to="/" onClick={closeMenu}>
          <img src="/img/logo.png" alt="Hijos de las Ventas" height="50" />
        </Link>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          onClick={toggleMenu}
          aria-controls="navbarNav" 
          aria-expanded={isOpen} 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`} id="navbarNav">
          {/* mx-auto aquí centra los enlaces en el espacio disponible */}
          <ul className="navbar-nav mx-auto mb-2 mb-xl-0 d-flex gap-2 fw-semibold">
            <li className="nav-item">
              <Link className="nav-link text-white" to="/" onClick={closeMenu}>Inicio</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" to="/productos" onClick={closeMenu}>Productos</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" to="/ofertas" onClick={closeMenu}>Ofertas</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" to="/nosotros" onClick={closeMenu}>Nosotros</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link text-white" to="/blogs" onClick={closeMenu}>Blogs</Link>
            </li>
          </ul>
          
          <div className="d-flex flex-column flex-xl-row gap-2 mt-3 mt-xl-0 align-items-xl-center">
            <Link to="/carrito" className="btn btn-warning fw-bold d-flex align-items-center justify-content-center" onClick={closeMenu}>
              <span className="me-2">🛒 Carrito</span>
              <span className="badge bg-light text-dark">0</span>
            </Link>
            <Link to="/login" className="btn btn-outline-light fw-semibold" onClick={closeMenu}>
              Iniciar Sesion
            </Link>
            <Link to="/registro" className="btn btn-outline-light fw-semibold" onClick={closeMenu}>
              Crear Cuenta
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;