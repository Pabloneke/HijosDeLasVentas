import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { initDB } from './services/db'
import './index.css'

// Los datos se siembran antes de montar la app: si se hiciera en un useEffect de App,
// las páginas hijas (ej. /productos) leerían el localStorage vacío en la primera carga.
initDB()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
