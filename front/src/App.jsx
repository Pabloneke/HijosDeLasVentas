import { Routes, Route } from 'react-router-dom'

// Aquí el equipo va agregando las páginas: <Route path="/productos" element={<Productos />} />
function App() {
  return (
    <Routes>
      <Route path="/" element={<h1>Hijos de las Ventas</h1>} />
    </Routes>
  )
}

export default App
