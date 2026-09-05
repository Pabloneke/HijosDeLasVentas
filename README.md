# 🛒 Hijos de las Ventas

<p align="center">
  <strong>Hijos de las Ventas</strong>
</p>

<p align="center">
  Sitio web para una tienda orientada a la presentación de productos, gestión de pedidos y contacto con clientes.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/Bootstrap-5.3.3-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white" alt="Bootstrap">
  <img src="https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
</p>

---

## 📌 Descripción

**Hijos de las Ventas** es un proyecto de sitio web para una tienda, desarrollado utilizando tecnologías web estándar.

El objetivo del proyecto es proporcionar una interfaz moderna, clara y adaptable que permita a los usuarios:

* 🏠 Conocer la tienda.
* 🛍️ Visualizar los productos disponibles.
* 📦 Realizar solicitudes o pedidos.
* 📊 Consultar información estadística.
* 📩 Contactar con la tienda.
* 📱 Navegar correctamente desde dispositivos móviles.

El proyecto utiliza **Bootstrap 5.3.3** para facilitar la construcción de una interfaz responsive y componentes reutilizables, complementándolo con CSS y JavaScript personalizados.

---

## ✨ Características

### 🏠 Página de inicio

La página principal presenta la identidad de **Hijos de las Ventas**, proporcionando una introducción a la tienda y acceso a las principales secciones del sitio.

### 🛍️ Catálogo de productos

La sección de productos permite visualizar los artículos disponibles mediante tarjetas organizadas en una cuadrícula responsive.

Cada producto puede presentar información como:

* Imagen.
* Nombre.
* Descripción.
* Precio.
* Información adicional.

Las imágenes utilizadas en el catálogo se almacenan localmente dentro del proyecto.

### 📩 Contacto y pedidos

La página de contacto incorpora un formulario destinado a recibir solicitudes y pedidos de los clientes.

El formulario utiliza las validaciones nativas proporcionadas por HTML5.

### 📊 Estadísticas

El proyecto incorpora una sección dedicada a la visualización de estadísticas de la tienda.

### 📱 Diseño responsive

La interfaz utiliza el sistema de grid de **Bootstrap**, permitiendo que los elementos se adapten a diferentes tamaños de pantalla:

* 💻 Computadores.
* 📱 Teléfonos móviles.
* 📲 Tablets.

---

## 🎨 Diseño

La identidad visual del proyecto utiliza una combinación de colores orientada a transmitir confianza, energía y dinamismo.

### Paleta de colores

| Variable         | Color     | Uso                                          |
| ---------------- | --------- | -------------------------------------------- |
| `--primary`      | `#0d6efd` | Color principal                              |
| `--primary-dark` | `#0a58ca` | Estados hover y elementos destacados         |
| `--warning`      | `#ffc107` | Elementos de atención y llamados a la acción |
| `--warning-dark` | `#e0a800` | Estados hover del amarillo                   |
| `--text-dark`    | `#1f2937` | Textos principales                           |

---

## 🛠️ Tecnologías utilizadas

### HTML5

Utilizado para construir la estructura semántica de las páginas.

Se emplean elementos como:

* `<header>`
* `<nav>`
* `<main>`
* `<section>`
* `<article>`
* `<footer>`

Esto permite mantener una estructura organizada y mejorar la accesibilidad y SEO básico del sitio.

### CSS3

Utilizado para los estilos personalizados del proyecto.

Entre sus funciones se encuentran:

* Personalización de componentes.
* Definición de la identidad visual.
* Ajustes de layout.
* Animaciones.
* Personalización del footer.
* Cinta promocional animada mediante `@keyframes`.

### Bootstrap 5.3.3

Framework utilizado para facilitar:

* Diseño responsive.
* Sistema de columnas.
* Cards.
* Formularios.
* Botones.
* Navegación.
* Componentes visuales.

Bootstrap se incorpora mediante CDN.

### JavaScript

Utilizado para implementar la lógica dinámica del sitio y preparar funcionalidades interactivas.

---

## 📂 Estructura del proyecto

```text
HijosDeLasVentas/
│
├── assets/
│   └── ...
│
├── index.html
├── productos.html
├── contacto.html
├── estadistica.html
├── funciones.js
│
└── README.md
```

### Archivos principales

| Archivo            | Descripción                                          |
| ------------------ | ---------------------------------------------------- |
| `index.html`       | Página principal de la tienda                        |
| `productos.html`   | Catálogo de productos                                |
| `contacto.html`    | Formulario de contacto y pedidos                     |
| `estadistica.html` | Página de estadísticas                               |
| `funciones.js`     | Funciones y lógica JavaScript                        |
| `assets/`          | Recursos gráficos y archivos utilizados por el sitio |

---

## ✅ Validaciones

El formulario de contacto utiliza validaciones nativas de HTML5 para mejorar la calidad de los datos ingresados.

### 📧 Correo electrónico

Se utiliza:

```html
<input type="email">
```

Esto permite al navegador validar que el usuario introduzca un formato de correo electrónico válido.

### 👤 Nombre

El campo de nombre utiliza una expresión regular para restringir la entrada a letras y espacios:

```regex
[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+
```

De esta forma se evita el ingreso de números o caracteres no permitidos.

### ♿ Accesibilidad

El proyecto incorpora atributos como:

```html
aria-required
aria-live
```

Además, se contemplan contenedores para mostrar mensajes de error dinámicos mediante JavaScript.

---

## 🚀 Instalación

Este proyecto es una aplicación web estática, por lo que **no requiere instalar Node.js, Java, Python ni una base de datos** para ejecutarlo en su estado actual.

### 1. Clonar el repositorio

```bash
git clone https://github.com/Pabloneke/HijosDeLasVentas.git
```

### 2. Entrar al proyecto

```bash
cd HijosDeLasVentas
```

### 3. Ejecutar

La aplicación puede abrirse directamente desde:

```text
index.html
```

También se recomienda utilizar una extensión como **Live Server** en Visual Studio Code para disponer de un servidor local durante el desarrollo.

---

## 💻 Ejecución con Visual Studio Code

1. Abrir el proyecto en Visual Studio Code.
2. Instalar la extensión **Live Server**.
3. Abrir `index.html`.
4. Presionar **"Go Live"**.
5. El sitio se abrirá automáticamente en el navegador.

---

## 🔗 Navegación

El sitio cuenta actualmente con las siguientes secciones:

```text
Inicio
 │
 ├── Productos
 │
 ├── Contacto
 │
 └── Estadísticas
```

---

## 📈 Estado del proyecto

Actualmente el proyecto se encuentra en una etapa de desarrollo frontend.

### Implementado

* [x] Página principal
* [x] Catálogo de productos
* [x] Página de contacto
* [x] Página de estadísticas
* [x] Diseño responsive
* [x] Bootstrap 5.3.3
* [x] Validaciones HTML5
* [x] Estilos personalizados
* [x] Recursos gráficos locales
* [x] Navegación entre páginas

### Próximas mejoras

* [ ] Implementar backend.
* [ ] Implementar base de datos.
* [ ] Sistema de usuarios.
* [ ] Carrito de compras.
* [ ] Sistema de autenticación.
* [ ] Gestión de productos.
* [ ] Gestión de pedidos.
* [ ] Persistencia de estadísticas.
* [ ] Validaciones dinámicas mediante JavaScript.
* [ ] Implementar API REST.
* [ ] Despliegue en producción.

---

## 🔮 Futuras funcionalidades

El proyecto puede evolucionar desde un sitio web estático hacia una plataforma completa de comercio electrónico.

Una posible arquitectura futura sería:

```text
                    ┌─────────────────┐
                    │    Frontend     │
                    │ HTML / CSS / JS │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │    REST API     │
                    │     Backend     │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
         ┌─────────┐   ┌──────────┐   ┌──────────┐
         │ Usuarios│   │ Productos│   │  Ventas  │
         └─────────┘   └──────────┘   └──────────┘
                             │
                             ▼
                       ┌──────────┐
                       │ Database │
                       └──────────┘
```

---

## 🎯 Objetivo académico

Este proyecto busca aplicar conocimientos relacionados con:

* Desarrollo web.
* HTML5 y CSS3.
* Diseño responsive.
* Frameworks frontend.
* JavaScript.
* Validación de formularios.
* Accesibilidad web.
* Organización de proyectos.
* Control de versiones con Git y GitHub.

---

## 👨‍💻 Autores

Proyecto desarrollado por el equipo de **Hijos de las Ventas**.

Repositorio:

**GitHub:**
https://github.com/Pabloneke/HijosDeLasVentas

---

## 📄 Licencia

Este proyecto fue desarrollado con fines académicos y educativos.

---

<p align="center">
  🛒 <strong>Hijos de las Ventas</strong> — Vendemos más que productos.
</p>
```

Este README quedaría **mucho más presentable para entregar como proyecto académico o mostrar en GitHub**. Además, no inventé funcionalidades que el repositorio actual no tenga: las marqué como futuras cuando corresponden.

Si quieres, también puedo hacerte una **versión todavía más profesional tipo README de proyecto real**, con **capturas de pantalla, badges, demo, tabla de funcionalidades y un diagrama Mermaid de la arquitectura actual**.

