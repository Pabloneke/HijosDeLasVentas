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

* **Catálogo Dinámico:** Tarjetas de productos generadas dinámicamente desde una base de datos simulada (`db.js`), con vistas de detalle individual.
* **Carrito de Compras (Context API):** Gestión global del estado del carrito, permitiendo agregar, eliminar y calcular el total en tiempo real sin *prop drilling*.
* **Rutas Protegidas:** Sistema de autenticación simulado con roles (`administrador`, `vendedor`, `cliente`) utilizando `React Router DOM` para restringir el acceso al panel de control (`/admin`).
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
| **React 18** | Librería principal para la construcción de interfaces de usuario. |
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
    │   ├── services/        # Simulación de Base de Datos en localStorage (db.js)
    │   ├── test/            # Configuración de pruebas unitarias
    │   └── utils/           # Funciones de validación, ofertas, precios y regiones
    │
    ├── index.html           # Punto de entrada de la SPA
    ├── package.json         # Dependencias y scripts del proyecto
    └── vite.config.js       # Configuración del entorno de Vite y Vitest
```

---

## 🚀 Instalación y Ejecución Local

Para levantar este proyecto en tu entorno local, asegúrate de tener instalado **Node.js**.

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
   npm run test
   ```

---

## 🔮 Arquitectura Futura (Roadmap)

El proyecto evoluciona desde una SPA con datos simulados hacia una plataforma completa de comercio electrónico conectada a servicios backend:

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
                       │  Oracle  │
                       └──────────┘
```

---

## 📈 Estado del Proyecto

### ✅ Implementado
* Arquitectura SPA con React, Vite y React Router DOM.
* Vistas públicas completas: `Home`, `Productos`, `DetalleProducto`, `Ofertas`, `Nosotros`, `Blogs` y `Contacto`.
* Flujo de carrito de compras y `Checkout` con persistencia y `CartContext`.
* Sistema de `Login`, `Registro` y control de acceso por roles mediante `AuthContext` y `RutaProtegida`.
* Panel de administración completo (`AdminDashboard`, `AdminProductos`, `AdminUsuarios`).
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