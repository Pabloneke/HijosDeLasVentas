import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'

import Navbar from './components/organisms/Navbar'
import Footer from './components/organisms/Footer'
import RutaProtegida from './components/organisms/RutaProtegida'
import Home from './pages/Home'
import Productos from './pages/Productos'
import Contacto from './pages/Contacto'
import Nosotros from './pages/Nosotros'
import Blogs from './pages/Blogs'
import Login from './pages/Login'
import Registro from './pages/Registro'
import Carrito from './pages/Carrito'
import Checkout from './pages/Checkout'

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Navbar />

        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/productos" element={<Productos />} />
        

        <Route path="/ofertas" element={<h1>Ofertas</h1>} />
        <Route path="/contacto" element={<Contacto />} />
        
        <Route path="/nosotros" element={<Nosotros />} />
        <Route path="/blogs" element={<Blogs />} />
        
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/checkout" element={<Checkout />} />

        {/* Zona privada: solo administrador y vendedor. Al construir cada vista basta con cambiar su element */}
        <Route element={<RutaProtegida roles={['administrador', 'vendedor']} />}>
          <Route path="/admin" element={<h1>Dashboard Admin</h1>} />
          <Route path="/admin/productos" element={<h1>Mantenedor Productos</h1>} />
        </Route>
        {/* La gestión de usuarios es solo del administrador */}
        <Route element={<RutaProtegida roles={['administrador']} />}>
          <Route path="/admin/usuarios" element={<h1>Mantenedor Usuarios</h1>} />
        </Route>
        </Routes>

        <Footer />
      </CartProvider>
    </AuthProvider>
  )
}

export default App