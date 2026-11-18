import { useEffect } from 'react'
import { Navigate, Outlet, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { initDB } from './services/db'

import Navbar from './components/organisms/Navbar'
import Footer from './components/organisms/Footer'
import RutaProtegida from './components/organisms/RutaProtegida'
import AdminLayout from './components/organisms/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProductos from './pages/admin/AdminProductos'
import AdminUsuarios from './pages/admin/AdminUsuarios'
import AdminOrdenes from './pages/admin/AdminOrdenes'
import Home from './pages/Home'
import Productos from './pages/Productos'
import DetalleProducto from './pages/DetalleProducto'
import Contacto from './pages/Contacto'
import Nosotros from './pages/Nosotros'
import Blogs from './pages/Blogs'
import Login from './pages/Login'
import Registro from './pages/Registro'
import Carrito from './pages/Carrito'
import Checkout from './pages/Checkout'
import Ofertas from './pages/Ofertas'

function RutaTienda() {
  const { user } = useAuth();
  return user?.tipo === 'vendedor' ? <Navigate to="/admin/productos" replace /> : <Outlet />;
}

function InicioAdmin() {
  const { user } = useAuth();
  return user?.tipo === 'vendedor' ? <Navigate to="/admin/productos" replace /> : <AdminDashboard />;
}

function App() {
  // Inicializamos la BD simulada al cargar la app
  useEffect(() => {
    initDB();
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        <div className="app-shell">
          <Navbar />

          <div className="app-content">
            <Routes>
            <Route element={<RutaTienda />}>
              <Route path="/" element={<Home />} />
              <Route path="/productos" element={<Productos />} />
              <Route path="/producto/:id" element={<DetalleProducto />} />
        
              <Route path="/ofertas" element={<Ofertas />} />
              <Route path="/contacto" element={<Contacto />} />
        
              <Route path="/nosotros" element={<Nosotros />} />
              <Route path="/blogs" element={<Blogs />} />
        
              <Route path="/login" element={<Login />} />
              <Route path="/registro" element={<Registro />} />
              <Route path="/carrito" element={<Carrito />} />
              <Route path="/checkout" element={<Checkout />} />
            </Route>

            {/* Zona privada: solo administrador y vendedor */}
            <Route element={<RutaProtegida roles={['administrador', 'vendedor']} />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<InicioAdmin />} />
                <Route path="/admin/productos" element={<AdminProductos />} />
                <Route path="/admin/ordenes" element={<AdminOrdenes />} />
                <Route element={<RutaProtegida roles={['administrador']} />}>
                  <Route path="/admin/usuarios" element={<AdminUsuarios />} />
                </Route>
              </Route>
            </Route>
            </Routes>
          </div>

          <Footer />
        </div>
      </CartProvider>
    </AuthProvider>
  )
}

export default App