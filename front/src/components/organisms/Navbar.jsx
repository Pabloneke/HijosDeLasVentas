import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const ENLACES = [
  { to: '/', texto: 'Inicio' },
  { to: '/productos', texto: 'Productos' },
  { to: '/ofertas', texto: 'Ofertas' },
  { to: '/nosotros', texto: 'Nosotros' },
  { to: '/blogs', texto: 'Blog' },
  { to: '/contacto', texto: 'Contacto' },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { itemCount, registerCartTarget } = useCart();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/');
  };

  // Solo administrador y vendedor ven el acceso al panel de administración
  const puedeAdministrar = user && (user.tipo === 'administrador' || user.tipo === 'vendedor');

  const isActive = (path) => (location.pathname === path ? 'active' : '');

  return (
    <header>
      <nav className="navbar navbar-expand-xl navbar-dark site-navbar px-3">
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
            {/* mx-auto centra los enlaces en el espacio disponible */}
            <ul className="navbar-nav mx-auto mb-2 mb-xl-0 gap-xl-1 fw-semibold">
              {ENLACES.map(({ to, texto }) => (
                <li className="nav-item" key={to}>
                  <Link className={`nav-link site-nav-link ${isActive(to)}`} to={to} onClick={closeMenu}>
                    {texto}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="site-nav-actions d-flex flex-column flex-xl-row gap-2 mt-3 mt-xl-0 align-items-xl-center">
              <Link
                ref={registerCartTarget}
                to="/carrito"
                className="btn cart-nav-button fw-bold d-flex align-items-center justify-content-center"
                onClick={closeMenu}
              >
                <span className="me-2" aria-hidden="true">🛒</span>
                <span>Carrito</span>
                <span className="badge cart-nav-count ms-2" aria-label={`${itemCount} productos`}>{itemCount}</span>
              </Link>

              {user ? (
                <>
                  <span className="site-nav-greeting fw-semibold">Hola, {user.nombre}</span>
                  {puedeAdministrar && (
                    <Link to="/admin" className="btn site-nav-btn site-nav-btn-admin fw-bold" onClick={closeMenu}>
                      Panel Admin
                    </Link>
                  )}
                  <button type="button" className="btn site-nav-btn site-nav-btn-outline fw-semibold" onClick={handleLogout}>
                    Cerrar Sesion
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn site-nav-btn site-nav-btn-outline fw-semibold" onClick={closeMenu}>
                    Iniciar Sesion
                  </Link>
                  <Link to="/registro" className="btn site-nav-btn site-nav-btn-solid fw-bold" onClick={closeMenu}>
                    Crear Cuenta
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
