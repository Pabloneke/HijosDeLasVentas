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

function App() {
  useEffect(() => {
    initDB();
  }, []);

  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/productos" element={<Productos />} />
        

        <Route path="/ofertas" element={<h1>Ofertas</h1>} />
        <Route path="/contacto" element={<Contacto />} />
        
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/blogs" element={<Blogs />} />
        
        <Route path="/login" element={<h1>Iniciar Sesión</h1>} />
        <Route path="/registro" element={<h1>Crear Cuenta</h1>} />
        <Route path="/carrito" element={<h1>Carrito de Compras</h1>} />
        <Route path="/checkout" element={<h1>Checkout y Pago</h1>} />
        
        <Route path="/admin" element={<h1>Dashboard Admin</h1>} />
        <Route path="/admin/productos" element={<h1>Mantenedor Productos</h1>} />
        <Route path="/admin/usuarios" element={<h1>Mantenedor Usuarios</h1>} />
      </Routes>

      <Footer />
    </>
  )
}

export default App