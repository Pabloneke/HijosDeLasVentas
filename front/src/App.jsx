import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'

import Navbar from './components/organisms/Navbar'
import Footer from './components/organisms/Footer'
import RutaProtegida from './components/organisms/RutaProtegida'
import AdminLayout from './components/organisms/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import Home from './pages/Home'
import Productos from './pages/Productos'
import Contacto from './pages/Contacto'
import Nosotros from './pages/Nosotros'
import Blogs from './pages/Blogs'
import Login from './pages/Login'
import Registro from './pages/Registro'

function App() {
  return (
    <AuthProvider>
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
        <Route path="/carrito" element={<h1>Carrito de Compras</h1>} />
        <Route path="/checkout" element={<h1>Checkout y Pago</h1>} />

        {/* Zona privada: solo administrador y vendedor. Al construir cada vista basta con cambiar su element */}
        <Route element={<RutaProtegida roles={['administrador', 'vendedor']} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/productos" element={<h1>Mantenedor Productos</h1>} />
            {/* La gestión de usuarios es solo del administrador */}
            <Route element={<RutaProtegida roles={['administrador']} />}>
              <Route path="/admin/usuarios" element={<h1>Mantenedor Usuarios</h1>} />
            </Route>
          </Route>
        </Route>
      </Routes>

      <Footer />
    </AuthProvider>
  )
}

export default App