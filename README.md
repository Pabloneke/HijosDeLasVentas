# 🛒 Hijos de las Ventas

> **Sitio web e-commerce orientado a la presentación de productos, gestión del carrito de compras y administración de plataforma.**

---

## 📌 Descripción

**Hijos de las Ventas** es un proyecto de comercio electrónico refactorizado y desarrollado como una **Single Page Application (SPA)** moderna. 
El objetivo del proyecto es proporcionar una interfaz rápida, escalable y adaptable que permita a los usuarios:
- 🏠 Navegar por la tienda de forma fluida y sin recargas.
- 🛍️ Visualizar y filtrar el catálogo de productos.
- 🛒 Gestionar su carrito de compras en tiempo real.
- 🔐 Autenticarse en el sistema (Login/Registro).
- ⚙️ Administrar la plataforma mediante un panel privado (Dashboard, Productos, Usuarios).

El proyecto utiliza **React** y **Bootstrap 5.3.3** para facilitar la construcción de una interfaz responsive mediante la metodología **Atomic Design**, asegurando componentes altamente reutilizables.

---

## ✨ Características Principales

* **Catálogo Dinámico:** Tarjetas de productos generadas dinámicamente desde el backend (`GET /api/v1/productos`), con vistas de detalle individual.
* **Carrito de Compras (Context API):** Gestión global del estado del carrito, permitiendo agregar, eliminar y calcular el total en tiempo real sin *prop drilling*.
* **Rutas Protegidas:** Autenticación con JWT contra el backend (el token de acceso dura 1 hora y se renueva solo con un *refresh token* en cookie HttpOnly) y roles (`administrador`, `vendedor`, `cliente`) con `React Router DOM` para restringir el acceso al panel de control (`/admin`).
* **Arquitectura Escalable:** Estructura de carpetas basada en *Atomic Design* (Átomos, Moléculas, Organismos, Páginas).
* **Diseño Responsive:** Adaptabilidad garantizada para 💻 Computadores, 📱 Tablets y 📲 Teléfonos móviles.

---

## 🎨 Diseño e Identidad Visual

La identidad visual del proyecto utiliza una combinación de colores orientada a transmitir confianza, energía y dinamismo:

| Variable | Color | Uso |
| :--- | :--- | :--- |
| `--primary` | `#0d6efd` | Color principal |
| `--primary-dark` | `#0a58ca` | Estados hover y elementos destacados |
| `--warning` | `#ffc107` | Elementos de atención y llamados a la acción (CTA) |
| `--warning-dark` | `#e0a800` | Estados hover del amarillo |
| `--text-dark` | `#1f2937` | Textos principales |

---

## 🛠️ Stack Tecnológico

| Tecnología | Uso en el Proyecto |
| :--- | :--- |
| **React 19** | Librería principal para la construcción de interfaces de usuario. |
| **Vite** | Entorno de desarrollo ultrarrápido y empaquetador (Bundler). |
| **React Router DOM** | Enrutamiento del lado del cliente (SPA) y protección de rutas. |
| **Context API** | Manejo de estados globales (Autenticación y Carrito). |
| **Bootstrap 5.3** | Framework CSS para grillas, modales, tarjetas y diseño responsive. |
| **Vitest** | Framework de pruebas unitarias para componentes y lógica de negocio. |

---

## 📂 Estructura del Proyecto (Atomic Design)

Toda la lógica de la aplicación se encuentra encapsulada dentro de la carpeta `front/`:

```text
HijosDeLasVentas/
│
└── front/
    ├── public/              # Recursos públicos e imágenes del catálogo
    ├── src/
    │   ├── assets/          # Recursos gráficos internos
    │   ├── components/      # Componentes UI reutilizables
    │   │   ├── atoms/       # Elementos indivisibles (FormField, etc.)
    │   │   ├── molecules/   # Agrupación de átomos (ProductCard, etc.)
    │   │   └── organisms/   # Secciones complejas (Navbar, Footer, AdminLayout, RutaProtegida)
    │   │
    │   ├── context/         # Estados globales (AuthContext, CartContext)
    │   ├── pages/           # Vistas enrutables (Home, Productos, DetalleProducto, Carrito, Checkout, admin/*)
    │   ├── services/        # Cliente HTTP del backend (api.js) y sesión (sesion.js)
    │   ├── test/            # Configuración de pruebas unitarias
    │   └── utils/           # Funciones de validación, ofertas, precios y regiones
    │
    ├── index.html           # Punto de entrada de la SPA
    ├── package.json         # Dependencias y scripts del proyecto
    └── vite.config.js       # Configuración del entorno de Vite y Vitest
```

---

## 🚀 Instalación y Ejecución Local

Necesitas **Node.js 20.19 o superior** y el **backend** corriendo, porque todos los datos (productos, usuarios, compras y sesión) vienen de su API REST.

**Orden de arranque:** MySQL → backend ([HijosDelasVentasBack](https://github.com/Pabloneke/HijosDelasVentasBack), ver su README) → frontend.

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/Pabloneke/HijosDeLasVentas.git
   ```

2. **Entrar al directorio del frontend:**
   ```bash
   cd HijosDeLasVentas/front
   ```

3. **Instalar las dependencias:**
   ```bash
   npm install
   ```

4. **Levantar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   *El sitio estará disponible en `http://localhost:5173`.*

5. **Ejecutar pruebas unitarias (opcional):**
   ```bash
   npm run test:run
   ```
   Las pruebas reemplazan la API con `vi.mock`, así que no necesitan el backend.

### 🔌 Conexión con el backend

* El frontend llama a `http://localhost:8080/api/v1` por defecto.
* Si el backend corre en otra dirección, crea `front/.env.local` con:
  ```bash
  VITE_API_URL=http://<servidor>:8080/api/v1
  ```
* El backend solo acepta peticiones (CORS) desde `http://localhost:5173`. Si Vite usa otro puerto porque el 5173 está ocupado, libéralo antes de abrir la tienda.

### 👤 Usuarios de prueba

Los carga el `data.sql` del backend:

| Correo | Contraseña | Rol |
| :--- | :--- | :--- |
| `admin@duoc.cl` | `admin123` | Administrador |
| `vendedor@duoc.cl` | `vende123` | Vendedor |
| `carla@gmail.com` | `cliente123` | Cliente |

Las cuentas nuevas se crean como **cliente** desde **Crear Cuenta**.

---

## 🏗️ Arquitectura

La SPA consume la API REST del backend Spring Boot, que protege los recursos con JWT y roles y guarda los datos en MySQL:

```text
                    ┌─────────────────┐
                    │  Frontend (SPA) │
                    │  React + Vite   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │    REST API     │
                    │   Spring Boot   │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
         ┌─────────┐   ┌──────────┐   ┌──────────┐
         │ Auth/JWT│   │ Productos│   │  Ventas  │
         └─────────┘   └──────────┘   └──────────┘
                             │
                             ▼
                       ┌──────────┐
                       │  MySQL   │
                       └──────────┘
```

---

## 📈 Estado del Proyecto

### ✅ Implementado
* Arquitectura SPA con React, Vite y React Router DOM.
* Vistas públicas completas: `Home`, `Productos`, `DetalleProducto`, `Ofertas`, `Nosotros`, `Blogs` y `Contacto`.
* Flujo de carrito de compras y `Checkout` con persistencia y `CartContext`.
* Sistema de `Login`, `Registro` y control de acceso por roles mediante `AuthContext` y `RutaProtegida`.
* Panel de administración completo (`AdminDashboard`, `AdminProductos`, `AdminUsuarios`, `AdminOrdenes`).
* Integración con el backend: catálogo, compras con boleta, mantenedores y órdenes mediante la API REST con JWT.
* Validaciones de formularios, cálculo de precios y pruebas unitarias con Vitest.

---

## 👨‍💻 Autores

Proyecto desarrollado por el equipo de Hijos de las Ventas:
* **Paulo Catalán**
* **Alexander Arancibia**
* **Mauricio Ahumada**
* **Branco Aliaga**

Repositorio oficial: [GitHub - HijosDeLasVentas](https://github.com/Pabloneke/HijosDeLasVentas)

📄 *Este proyecto fue desarrollado con fines académicos y educativos.*