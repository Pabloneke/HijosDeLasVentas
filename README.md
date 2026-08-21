# Documentación del Proyecto: Tienda "Lo quieres, te lo vendo"

## 1. Tecnologías Implementadas
* **HTML5 Semántico:** Estructuramos el código usando etiquetas modernas (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`) para cumplir con las buenas prácticas y mejorar el SEO del sitio.
* **CSS3 (Estilos Personalizados):** Mantuvimos un archivo propio para los requerimientos específicos de diseño (como el footer negro) y creamos una animación de la cinta promocional infinita utilizando `@keyframes`.
* **Bootstrap 5.3.3:** Unificamos el diseño visual conectando este framework vía CDN. Esto nos permitió hacer la página responsiva para celulares automáticamente y usar componentes prearmados.

## 2. Vistas del Proyecto
* **Inicio (`index.html`):** Página de presentación estructurada de forma limpia, destacando el mensaje de bienvenida y el extracto de la tienda.
* **Productos (`productos.html`):** Catálogo de artículos organizado con el sistema de grillas de Bootstrap (`row` y `col-md-4`). Las tarjetas se adaptan a cualquier pantalla e incluyen imágenes cargadas de forma local.
* **Contacto (`contacto.html`):** Formulario de pedidos con un diseño moderno tipo tarjeta, utilizando las clases nativas de control de formularios del framework.

## 3. Validaciones del Formulario (HTML5 Nativo)
* **Correos Electrónicos:** Utilizamos `<input type="email">`, lo que obliga al navegador a exigir el símbolo `@` sin necesidad de programar lógica extra.
* **Bloqueo de Números (Regex):** En el campo del nombre implementamos el atributo `pattern="[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+"`. Esta expresión regular bloquea números y caracteres extraños, permitiendo solo letras y espacios.
* **Accesibilidad y Preparación Futura:** Integramos los atributos `aria-required` y `aria-live` solicitados, además de preparar los contenedores `<span class="error-msg">` vacíos para la futura implementación de mensajes de error dinámicos con JavaScript.
