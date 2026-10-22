import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  // Estado para controlar si el menú hamburguesa está abierto o cerrado
  const [isOpen, setIsOpen] = useState(false);

  // Función para alternar el menú
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Función para cerrar el menú al hacer clic en un enlace (útil en celulares)
  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Cambiamos navbar-expand-lg por navbar-expand-xl para que colapse antes y no se solape */}
      <nav className="navbar navbar-expand-xl navbar-dark bg-primary px-3">
        <div className="container-fluid">
          <Link className="navbar-brand d-flex align-items-center" to="/" onClick={closeMenu}>
            <img src="/img/logo.png" alt="Hijos de las Ventas" height="50" />
          </Link>
          
          {/* Botón hamburguesa controlado por React */}
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

          {/* El div colapsable. Si isOpen es true, le agregamos la clase "show" de Bootstrap */}
          <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`} id="navbarNav">
            <ul className="navbar-nav me-auto mb-2 mb-xl-0 d-flex gap-2 fw-semibold">
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

      {/* Cinta amarilla de ofertas (se mantiene igual) */}
      <div className="bg-warning py-1 overflow-hidden">
        <div className="d-flex text-dark fw-bold" style={{ whiteSpace: 'nowrap', animation: 'marquee 15s linear infinite' }}>
          HIJOS DE LAS VENTAS 💸 - 🔥 HIJOS DE LAS VENTAS 💸 - 🔥 HIJOS DE LAS VENTAS 💸 - 🔥 HIJOS DE LAS VENTAS 💸 - 🔥
        </div>
      </div>
    </>
  );
};

export default Navbar;