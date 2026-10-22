import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom' 
import { initDB } from './services/db'

import Navbar from './components/organisms/Navbar'
import Footer from './components/organisms/Footer'
import Home from './pages/Home'
import Productos from './pages/Productos'
import Contacto from './pages/Contacto'
import Nosotros from './pages/Nosotros'
import Blogs from './pages/Blogs'
import Carrito from './pages/Carrito'
import Checkout from './pages/Checkout'
import Ofertas from './pages/Ofertas'
import { CartProvider } from './context/CartContext'

function App() {
  useEffect(() => {
    initDB();
  }, []);

  return (
    <CartProvider>
      <div className="app-shell">
        <Navbar />

        <div className="app-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/productos" element={<Productos />} />

            <Route path="/ofertas" element={<Ofertas />} />
            <Route path="/contacto" element={<Contacto />} />

            <Route path="/nosotros" element={<Nosotros />} />
            <Route path="/blogs" element={<Blogs />} />

            <Route path="/login" element={<h1>Iniciar Sesión</h1>} />
            <Route path="/registro" element={<h1>Crear Cuenta</h1>} />
            <Route path="/carrito" element={<Carrito />} />
            <Route path="/checkout" element={<Checkout />} />

            <Route path="/admin" element={<h1>Dashboard Admin</h1>} />
            <Route path="/admin/productos" element={<h1>Mantenedor Productos</h1>} />
            <Route path="/admin/usuarios" element={<h1>Mantenedor Usuarios</h1>} />
          </Routes>
        </div>

        <Footer />
      </div>
    </CartProvider>
  )
}

export default App