// CONFIGURACIÓN: clave utilizada para guardar el carrito en localStorage.
const CART_KEY = 'loQuieresCarrito';

// FORMATEO DE MONEDA: convierte valores numéricos al formato de pesos chilenos.
function formatCurrency(value) {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0
    }).format(value);
}

// VALIDACIÓN DE EMAIL: comprueba que el texto tenga forma de correo (texto@texto.dominio).
function esEmailValido(email) {
    const patronEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return patronEmail.test(email);
}

// VALIDACIÓN DE DOMINIO DE EMAIL: solo permite los dominios autorizados por el negocio (Anexo 1).
function esDominioPermitido(email) {
    const dominiosPermitidos = ['duoc.cl', 'profesor.duoc.cl', 'gmail.com'];
    const dominio = email.split('@')[1]?.toLowerCase().trim();
    return dominiosPermitidos.includes(dominio);
}

// VALIDACIÓN DE NOMBRE: solo letras y espacios (incluye tildes y ñ), largo entre 3 y 100 (Anexo 1).
function esNombreValido(nombre) {
    const patronNombre = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    return patronNombre.test(nombre) && nombre.length >= 3 && nombre.length <= 100;
}

// LECTURA DEL CARRITO: recupera los productos guardados en localStorage.
function getCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (error) {
        return [];
    }
}

// GUARDADO DEL CARRITO: convierte el carrito a JSON y lo almacena localmente.
function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// CÁLCULO DEL TOTAL: suma precio por cantidad de cada producto.
function getCartTotal(cart) {
    return cart.reduce((total, item) => total + Number(item.price) * Number(item.quantity), 0);
}

// RENDERIZADO DEL CARRITO: actualiza contador, productos y total en pantalla.
function renderCart() {
    const cart = getCart();
    const total = getCartTotal(cart);
    const badge = document.getElementById('cartCountBadge');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');

    if (badge) {
        const count = cart.reduce((sum, item) => sum + Number(item.quantity), 0);
        badge.textContent = count;
    }

    if (cartItems) {
        if (!cart.length) {
            cartItems.innerHTML = '<p class="text-muted mb-0">Tu carrito está vacío.</p>';
        } else {
            cartItems.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <div>
                        <strong>${item.name}</strong>
                        <small>Cantidad: ${item.quantity}</small>
                    </div>
                    <span>${formatCurrency(Number(item.price) * Number(item.quantity))}</span>
                </div>
            `).join('');
        }
    }

    if (cartTotal) {
        cartTotal.textContent = formatCurrency(total);
    }
}

// RENDERIZADO DEL CARRITO DE CONTACTO: muestra el resumen del pedido en contacto.html.
function renderContactCart() {
    const cart = getCart();
    const container = document.getElementById('contactCartItems');
    const total = document.getElementById('contactCartTotal');

    if (!container) return;

    if (!cart.length) {
        container.innerHTML = '<p class="text-muted mb-0">Aún no has agregado productos.</p>';
        if (total) total.textContent = formatCurrency(0);
        return;
    }

    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div>
                <strong>${item.name}</strong>
                <small>${item.quantity} x ${formatCurrency(Number(item.price))}</small>
            </div>
            <span>${formatCurrency(Number(item.price) * Number(item.quantity))}</span>
        </div>
    `).join('');

    if (total) total.textContent = formatCurrency(getCartTotal(cart));
}

// AGREGAR PRODUCTOS: añade un producto nuevo o aumenta la cantidad existente.
function addToCart(name, price) {
    const cart = getCart();
    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name, price: Number(price), quantity: 1 });
    }

    saveCart(cart);
    renderCart();
    renderContactCart();
}

// VACIAR CARRITO: elimina todos los productos guardados.
function clearCart() {
    saveCart([]);
    renderCart();
    renderContactCart();
}

// INICIALIZACIÓN: espera a que el HTML esté cargado antes de activar los eventos.
document.addEventListener('DOMContentLoaded', () => {
    // NAVEGACIÓN ACTIVA: identifica la página actual y marca su enlace.
    const links = document.querySelectorAll('.navbar .nav-link');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    links.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
        }
    });

    // PANEL DEL CARRITO: muestra u oculta el contenido del carrito.
    const toggleCartBtn = document.getElementById('toggleCartBtn');
    const cartPanel = document.getElementById('cartPanel');

    if (toggleCartBtn && cartPanel) {
        toggleCartBtn.addEventListener('click', () => {
            cartPanel.style.display = cartPanel.style.display === 'none' ? 'block' : 'none';
        });
    }

    // BOTONES AGREGAR AL CARRITO: escucha el clic y actualiza temporalmente el botón.
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', () => {
            addToCart(button.dataset.name, button.dataset.price);
            const originalText = button.textContent;
            button.textContent = 'Agregado';
            button.classList.add('btn-success');
            button.classList.remove('btn-outline-primary');
            setTimeout(() => {
                button.textContent = originalText;
                button.classList.remove('btn-success');
                button.classList.add('btn-outline-primary');
            }, 1000);
        });
    });

    // BOTÓN VACIAR CARRITO: elimina todos los productos al hacer clic.
    const clearCartBtn = document.getElementById('clearCartBtn');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', clearCart);
    }

    // ACTUALIZACIÓN INICIAL: carga el estado guardado del carrito en la interfaz.
    renderCart();
    renderContactCart();

    // FORMULARIO DE CONTACTO: obtiene la referencia al formulario por su ID.
    const formulario = document.getElementById('contactForm');

    if (formulario) {
        // EVENTO SUBMIT: escucha el envío del formulario sin recargar la página.
        formulario.addEventListener('submit', (event) => {
            // 3. Evitar el envío por defecto (recarga de la página)
            event.preventDefault();

            // CAMPOS DEL FORMULARIO: obtiene inputs, selects y textarea.
            // Obtener los elementos de input / select / textarea
            const inputNombre = document.getElementById('nombre');
            const inputEmail = document.getElementById('email');
            const selectMetodoPago = document.getElementById('metodo-pago');
            const selectTipoEntrega = document.getElementById('tipo-entrega');
            const txtMensaje = document.getElementById('mensaje');

            // MENSAJES DE ERROR: referencias a los span que informan campos inválidos.
            // Obtener los elementos <span> para mostrar los mensajes de error
            const errorNombre = document.getElementById('error-nombre');
            const errorEmail = document.getElementById('error-email');
            const errorMetodo = document.getElementById('error-metodo');
            const errorEntrega = document.getElementById('error-entrega');
            const errorMensaje = document.getElementById('error-mensaje');

            let tieneErrores = false;
            let camposVacios = [];

            // Limpiar errores y bordes antes de validar
            [inputNombre, inputEmail, selectMetodoPago, selectTipoEntrega, txtMensaje].forEach(campo => {
                if (campo) {
                    campo.classList.remove('border-danger', 'is-invalid');
                }
            });

            if (errorNombre) errorNombre.textContent = '';
            if (errorEmail) errorEmail.textContent = '';
            if (errorMetodo) errorMetodo.textContent = '';
            if (errorEntrega) errorEntrega.textContent = '';
            if (errorMensaje) errorMensaje.textContent = '';

            // VALIDACIÓN DE CAMPOS: comprueba que los datos obligatorios no estén vacíos.
            // 4. Validación de campos vacíos (.value.trim() === '')
            
            // Validar Nombre completo
            if (!inputNombre || inputNombre.value.trim() === '') {
                tieneErrores = true;
                camposVacios.push('Nombre completo');
                inputNombre.classList.add('is-invalid');
                if (errorNombre) errorNombre.textContent = 'El nombre completo es obligatorio.';
            } else if (inputNombre.value.trim().length > 100) {
                // Regla de negocio (Anexo 1): nombre máximo 100 caracteres.
                tieneErrores = true;
                inputNombre.classList.add('is-invalid');
                if (errorNombre) errorNombre.textContent = 'El nombre no puede superar los 100 caracteres.';
            } else if (!esNombreValido(inputNombre.value.trim())) {
                // Regla de negocio (Anexo 1): solo letras y espacios.
                tieneErrores = true;
                inputNombre.classList.add('is-invalid');
                if (errorNombre) errorNombre.textContent = 'El nombre solo puede contener letras y espacios.';
            }

            // Validar Correo electrónico: primero que no esté vacío, luego que tenga formato válido
            if (!inputEmail || inputEmail.value.trim() === '') {
                tieneErrores = true;
                camposVacios.push('Correo electrónico');
                inputEmail.classList.add('is-invalid');
                if (errorEmail) errorEmail.textContent = 'El correo electrónico es obligatorio.';
            } else if (!esEmailValido(inputEmail.value.trim())) {
                tieneErrores = true;
                inputEmail.classList.add('is-invalid');
                if (errorEmail) errorEmail.textContent = 'Ingresa un correo electrónico con formato válido (ej: nombre@dominio.com).';
            } else if (inputEmail.value.trim().length > 100) {
                // Regla de negocio (Anexo 1): correo máximo 100 caracteres.
                tieneErrores = true;
                inputEmail.classList.add('is-invalid');
                if (errorEmail) errorEmail.textContent = 'El correo no puede superar los 100 caracteres.';
            } else if (!esDominioPermitido(inputEmail.value.trim())) {
                // Regla de negocio (Anexo 1): solo dominios autorizados.
                tieneErrores = true;
                inputEmail.classList.add('is-invalid');
                if (errorEmail) errorEmail.textContent = 'Solo se aceptan correos @duoc.cl, @profesor.duoc.cl o @gmail.com.';
            }

            // Validar Método de pago
            if (!selectMetodoPago || selectMetodoPago.value.trim() === '') {
                tieneErrores = true;
                camposVacios.push('Método de pago');
                selectMetodoPago.classList.add('is-invalid');
                if (errorMetodo) errorMetodo.textContent = 'Debe seleccionar un método de pago.';
            }

            // Validar Tipo de entrega
            if (!selectTipoEntrega || selectTipoEntrega.value.trim() === '') {
                tieneErrores = true;
                camposVacios.push('Tipo de entrega');
                selectTipoEntrega.classList.add('is-invalid');
                if (errorEntrega) errorEntrega.textContent = 'Debe seleccionar un tipo de entrega.';
            }

            // Validar Detalle de la compra (Anexo 1: requerido, máximo 500 caracteres)
            if (!txtMensaje || txtMensaje.value.trim() === '') {
                tieneErrores = true;
                camposVacios.push('Detalle de la compra');
                txtMensaje.classList.add('is-invalid');
                if (errorMensaje) errorMensaje.textContent = 'El detalle de la compra es obligatorio.';
            } else if (txtMensaje.value.trim().length > 500) {
                tieneErrores = true;
                txtMensaje.classList.add('is-invalid');
                if (errorMensaje) errorMensaje.textContent = 'El detalle no puede superar los 500 caracteres.';
            }

            // PROCESAMIENTO DEL PEDIDO: muestra errores o genera el resumen de compra.
            // 5. Desplegar alerta o procesar el formulario
            if (tieneErrores) {
                alert(`Por favor completa los siguientes campos vacíos:\n- ${camposVacios.join('\n- ')}`);
            } else {
                const cart = getCart();
                const productosSeleccionados = cart.length
                    ? cart.map(item => `${item.quantity}x ${item.name} (${formatCurrency(item.price * item.quantity)})`).join('\n- ')
                    : 'Sin productos seleccionados';

                const metodoPago = selectMetodoPago.options[selectMetodoPago.selectedIndex].text;
                const tipoEntrega = selectTipoEntrega.options[selectTipoEntrega.selectedIndex].text;
                const observaciones = txtMensaje && txtMensaje.value.trim() ? `\n\nObservaciones: ${txtMensaje.value.trim()}` : '\n\nObservaciones: Sin comentarios adicionales';

                if (txtMensaje) {
                    txtMensaje.value = `Resumen de compra:\n- ${productosSeleccionados}\n\nMétodo de pago: ${metodoPago}\nTipo de entrega: ${tipoEntrega}${observaciones}`;
                }

                alert('¡Compra confirmada con éxito!');
                clearCart();
                formulario.reset(); // Reiniciar el formulario
            }
        });
    }
    // DATATABLES: inicializa la tabla de estadísticas con paginación y diseño responsive.
    if (window.jQuery && typeof window.jQuery === 'function') {
        window.jQuery(function () {
            const tabla = document.getElementById('tablaEstadisticas');
            if (tabla && window.jQuery.fn && window.jQuery.fn.DataTable) {
                window.jQuery(tabla).DataTable({
                    language: {
                        url: 'https://cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
                    },
                    pageLength: 5,
                    responsive: true
                });
            }
        });
    }
});
// ============================================================================
// PRIORIDAD 3 — CATÁLOGO DINÁMICO DE PRODUCTOS
// Arreglo de objetos que reemplaza los productos estáticos de productos.html.
// Se guarda en localStorage para que los cambios hechos en el mantenedor del
// administrador (admin-productos.html) se reflejen en la tienda.
// ============================================================================
const PRODUCTOS_KEY = 'loQuieresProductos';

const PRODUCTOS_INICIALES = [
    {
        codigo: 'PRD-001',
        nombre: 'Perfume Hawas for Men',
        descripcion: 'Rasasi Hawas Ice Edp 100ml. Fragancia con excelente proyección para destacar en el día a día.',
        precio: 45990,
        stock: 12,
        stockCritico: 3,
        categoria: 'Perfumería',
        imagen: 'assets/img/RasasiHawas.webp'
    },
    {
        codigo: 'PRD-002',
        nombre: 'Mousepad Gamer XL',
        descripcion: 'Mouse Pad gamer Redragon Flick de goma y tela pad para mouse xl 40cm x 90cm x 4mm negro.',
        precio: 12500,
        stock: 25,
        stockCritico: 5,
        categoria: 'Computación',
        imagen: 'assets/img/MousePadXXL.webp'
    },
    {
        codigo: 'PRD-003',
        nombre: 'Manga Dorohedoro - Tomo 1',
        descripcion: 'Empieza a leer esta joya en tus tiempos muertos.',
        precio: 9990,
        stock: 8,
        stockCritico: 2,
        categoria: 'Almacén',
        imagen: 'assets/img/Dorohedoro1.webp'
    },
    {
        codigo: 'PRD-004',
        nombre: 'GTA VI',
        descripcion: 'Grand Theft Auto VI is Now Set to Launch November 19, 2026',
        precio: 99990,
        stock: 15,
        stockCritico: 3,
        categoria: 'Computación',
        imagen: 'assets/img/GTA-VI.webp'
    },
    {
        codigo: 'PRD-005',
        nombre: 'PlayStation - PS14',
        descripcion: 'Consola de nueva generación con carga ultra rápida, gráficos en 4K y control inalámbrico incluido.',
        precio: 499990,
        stock: 10,
        stockCritico: 2,
        categoria: 'Computación',
        imagen: 'assets/img/PS14.webp'
    },
    {
        codigo: 'PRD-006',
        nombre: 'Teclado Gamer',
        descripcion: 'Teclado Gamer Redragon Kumara Black Red Switch Spanish K552RGB-1R-SP.',
        precio: 24990,
        stock: 18,
        stockCritico: 4,
        categoria: 'Computación',
        imagen: 'assets/img/Teclado.webp'
    }
];

// LECTURA DEL CATÁLOGO: si nunca se ha guardado nada, se usa el arreglo inicial.
function getProductos() {
    try {
        const guardados = JSON.parse(localStorage.getItem(PRODUCTOS_KEY));
        return (guardados && guardados.length) ? guardados : PRODUCTOS_INICIALES;
    } catch (error) {
        return PRODUCTOS_INICIALES;
    }
}

// GUARDADO DEL CATÁLOGO.
function saveProductos(productos) {
    localStorage.setItem(PRODUCTOS_KEY, JSON.stringify(productos));
}

// RENDERIZAR CATÁLOGO EN productos.html: genera las cards a partir del arreglo de productos.
function renderCatalogoProductos() {
    const contenedor = document.getElementById('catalogoProductos');
    if (!contenedor) return;

    const productos = getProductos();

    contenedor.innerHTML = productos.map(p => `
        <div class="col-md-4">
            <article class="card h-100 shadow-sm border-0">
                <a href="detalle-producto.html?codigo=${p.codigo}">
                    <img src="${p.imagen}" height="300" width="300" class="card-img-top" alt="${p.nombre}">
                </a>
                <div class="card-body d-flex flex-column text-center">
                    <h5 class="card-title fw-bold">${p.nombre}</h5>
                    <p class="card-text text-muted">${p.descripcion}</p>
                    <h4 class="text-primary fw-bold mt-auto">${formatCurrency(p.precio)}</h4>
                    <button type="button" class="btn btn-outline-primary mt-3 fw-bold add-to-cart-btn"
                            data-name="${p.nombre}" data-price="${p.precio}">Lo quiero</button>
                </div>
            </article>
        </div>
    `).join('');

    // Vuelve a enlazar los botones "Lo quiero" recién creados (los generados dinámicamente no
    // existían cuando corrió el listener original de document.querySelectorAll('.add-to-cart-btn')).
    contenedor.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', () => {
            addToCart(button.dataset.name, button.dataset.price);
            const originalText = button.textContent;
            button.textContent = 'Agregado';
            button.classList.add('btn-success');
            button.classList.remove('btn-outline-primary');
            setTimeout(() => {
                button.textContent = originalText;
                button.classList.remove('btn-success');
                button.classList.add('btn-outline-primary');
            }, 1000);
        });
    });
}

// ============================================================================
// PRIORIDAD 3 — VALIDACIÓN DE RUN CHILENO
// Sin puntos ni guion (ej: 19011022K), largo entre 7 y 9, con dígito verificador
// calculado mediante el algoritmo módulo 11.
// ============================================================================
function esRunValido(run) {
    if (!run) return false;
    const limpio = run.trim().toUpperCase();

    if (limpio.length < 7 || limpio.length > 9) return false;
    if (!/^[0-9]+[0-9K]$/.test(limpio)) return false;

    const cuerpo = limpio.slice(0, -1);
    const dv = limpio.slice(-1);

    let suma = 0;
    let multiplicador = 2;
    for (let i = cuerpo.length - 1; i >= 0; i--) {
        suma += parseInt(cuerpo[i], 10) * multiplicador;
        multiplicador = (multiplicador === 7) ? 2 : multiplicador + 1;
    }

    const resto = 11 - (suma % 11);
    let dvEsperado;
    if (resto === 11) dvEsperado = '0';
    else if (resto === 10) dvEsperado = 'K';
    else dvEsperado = String(resto);

    return dv === dvEsperado;
}

// ============================================================================
// PRIORIDAD 3 — MANTENEDOR DE USUARIOS (admin-usuarios.html)
// ============================================================================
const USUARIOS_KEY = 'loQuieresUsuariosAdmin';

const USUARIOS_INICIALES = [
    { run: '190110226', nombre: 'Paulo', apellidos: 'Catalán', correo: 'admin@duoc.cl', tipo: 'administrador', direccion: 'Av. Siempre Viva 123', region: 'Región Metropolitana de Santiago', comuna: 'Santiago' },
    { run: '182345678', nombre: 'Mauricio', apellidos: 'Ahumada', correo: 'vendedor@duoc.cl', tipo: 'vendedor', direccion: 'Calle Los Alerces 456', region: 'Región del Biobío', comuna: 'Concepción' },
    { run: '209876543', nombre: 'Carla', apellidos: 'Gómez', correo: 'carla@gmail.com', tipo: 'cliente', direccion: 'Pasaje Las Rosas 789', region: 'Región de Valparaíso', comuna: 'Viña del Mar' }
];

function getUsuariosAdmin() {
    try {
        const guardados = JSON.parse(localStorage.getItem(USUARIOS_KEY));
        return (guardados && guardados.length) ? guardados : USUARIOS_INICIALES;
    } catch (error) {
        return USUARIOS_INICIALES;
    }
}

function saveUsuariosAdmin(usuarios) {
    localStorage.setItem(USUARIOS_KEY, JSON.stringify(usuarios));
}

// ============================================================================
// PRIORIDAD 1 — CARRITO.HTML: cantidad +/-, eliminar producto puntual y cupones
// ============================================================================
const CUPON_KEY = 'loQuieresCupon';

// CUPONES DE DEMOSTRACIÓN: como no hay backend, se validan contra esta lista fija.
const CUPONES_VALIDOS = {
    'DUOC10': 0.10,
    'BIENVENIDO': 0.15
};

function getCuponAplicado() {
    try {
        return JSON.parse(localStorage.getItem(CUPON_KEY));
    } catch (error) {
        return null;
    }
}

// ACTUALIZAR CANTIDAD DE UN ÍTEM DEL CARRITO (botones +/- de carrito.html).
function actualizarCantidadCarrito(name, delta) {
    const cart = getCart();
    const item = cart.find(i => i.name === name);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
        eliminarDelCarrito(name);
        return;
    }

    saveCart(cart);
    renderCart();
    renderContactCart();
    if (typeof renderCarritoPagina === 'function') renderCarritoPagina();
}

// ELIMINAR UN PRODUCTO PUNTUAL DEL CARRITO (botón 🗑 de carrito.html).
function eliminarDelCarrito(name) {
    const cart = getCart().filter(i => i.name !== name);
    saveCart(cart);
    renderCart();
    renderContactCart();
    if (typeof renderCarritoPagina === 'function') renderCarritoPagina();
}

// RENDERIZAR LA PÁGINA carrito.html COMPLETA: items con controles de cantidad,
// subtotal, descuento por cupón y total final.
function renderCarritoPagina() {
    const cart = getCart();
    const contenedor = document.getElementById('carritoDetalle');
    if (!contenedor) return;

    if (!cart.length) {
        contenedor.innerHTML = '<p class="text-muted mb-0">Tu carrito está vacío. <a href="productos.html">Ir a productos</a></p>';
    } else {
        contenedor.innerHTML = cart.map(item => `
            <div class="d-flex justify-content-between align-items-center border-bottom py-3 flex-wrap gap-2">
                <div>
                    <strong>${item.name}</strong>
                    <div class="text-muted small">${formatCurrency(item.price)} c/u</div>
                </div>
                <div class="d-flex align-items-center gap-2">
                    <button type="button" class="btn btn-sm btn-outline-secondary btn-cantidad-carrito" data-name="${item.name}" data-delta="-1">−</button>
                    <span class="fw-bold" style="min-width: 20px; text-align:center;">${item.quantity}</span>
                    <button type="button" class="btn btn-sm btn-outline-secondary btn-cantidad-carrito" data-name="${item.name}" data-delta="1">+</button>
                    <span class="fw-bold ms-3" style="min-width: 90px; text-align:right;">${formatCurrency(item.price * item.quantity)}</span>
                    <button type="button" class="btn btn-sm btn-outline-danger btn-eliminar-item-carrito" data-name="${item.name}" title="Eliminar">🗑</button>
                </div>
            </div>
        `).join('');

        contenedor.querySelectorAll('.btn-cantidad-carrito').forEach(btn => {
            btn.addEventListener('click', () => actualizarCantidadCarrito(btn.dataset.name, Number(btn.dataset.delta)));
        });
        contenedor.querySelectorAll('.btn-eliminar-item-carrito').forEach(btn => {
            btn.addEventListener('click', () => eliminarDelCarrito(btn.dataset.name));
        });
    }

    const subtotal = getCartTotal(cart);
    const cupon = getCuponAplicado();
    const descuento = cupon ? subtotal * cupon.descuento : 0;
    const total = subtotal - descuento;

    const subtotalEl = document.getElementById('carritoSubtotal');
    const descuentoEl = document.getElementById('carritoDescuento');
    const totalEl = document.getElementById('carritoTotalFinal');

    if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);
    if (descuentoEl) descuentoEl.textContent = descuento > 0 ? ('- ' + formatCurrency(descuento)) : formatCurrency(0);
    if (totalEl) totalEl.textContent = formatCurrency(total);
}

// ============================================================================
// INICIALIZACIÓN ESPECÍFICA DE LAS NUEVAS VISTAS (se agrega un segundo listener
// DOMContentLoaded para no tocar el bloque original que ya existía en el archivo).
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {

    // --- productos.html: renderiza el catálogo dinámico si existe el contenedor ---
    renderCatalogoProductos();

    // --- carrito.html: renderiza el detalle del carrito con cantidad y cupón ---
    const contenedorCarritoDetalle = document.getElementById('carritoDetalle');
    if (contenedorCarritoDetalle) {
        renderCarritoPagina();

        const btnAplicarCupon = document.getElementById('btnAplicarCupon');
        if (btnAplicarCupon) {
            btnAplicarCupon.addEventListener('click', () => {
                const inputCupon = document.getElementById('inputCupon');
                const mensajeCupon = document.getElementById('mensajeCupon');
                const codigo = inputCupon.value.trim().toUpperCase();
                const descuento = CUPONES_VALIDOS[codigo] || 0;

                if (descuento > 0) {
                    localStorage.setItem(CUPON_KEY, JSON.stringify({ codigo, descuento }));
                    if (mensajeCupon) {
                        mensajeCupon.textContent = `Cupón aplicado: ${Math.round(descuento * 100)}% de descuento.`;
                        mensajeCupon.className = 'text-success small mt-1 d-block';
                    }
                } else {
                    localStorage.removeItem(CUPON_KEY);
                    if (mensajeCupon) {
                        mensajeCupon.textContent = 'Cupón inválido o vencido.';
                        mensajeCupon.className = 'text-danger small mt-1 d-block';
                    }
                }
                renderCarritoPagina();
            });
        }

        const btnPagar = document.getElementById('btnPagar');
        if (btnPagar) {
            btnPagar.addEventListener('click', () => {
                if (!getCart().length) {
                    alert('Tu carrito está vacío.');
                    return;
                }
                alert('¡Gracias por tu compra! (simulación: aún no hay pasarela de pago real)');
                clearCart();
                localStorage.removeItem(CUPON_KEY);
                renderCarritoPagina();
            });
        }
    }

    // --- registro.html y admin-usuario-nuevo/editar.html: validación de RUN en vivo ---
    const inputRunGenerico = document.getElementById('regRun') || document.getElementById('userRun');
    if (inputRunGenerico) {
        inputRunGenerico.addEventListener('input', () => {
            const errorId = inputRunGenerico.id === 'regRun' ? 'error-regRun' : 'error-userRun';
            const errorRun = document.getElementById(errorId);
            const valor = inputRunGenerico.value.trim();

            if (!valor) {
                inputRunGenerico.classList.remove('is-invalid');
                if (errorRun) errorRun.textContent = '';
            } else if (!esRunValido(valor)) {
                inputRunGenerico.classList.add('is-invalid');
                if (errorRun) errorRun.textContent = 'RUN inválido (sin puntos ni guion, ej: 19011022K).';
            } else {
                inputRunGenerico.classList.remove('is-invalid');
                if (errorRun) errorRun.textContent = '';
            }
        });
    }

    // --- admin-productos.html: mantenedor de productos (listar, crear, editar, eliminar) ---
    const tablaAdminProductosBody = document.getElementById('tablaAdminProductosBody');
    if (tablaAdminProductosBody) {
        let codigoEnEdicion = null;

        function renderTablaAdminProductos() {
            const productos = getProductos();
            tablaAdminProductosBody.innerHTML = productos.map(p => `
                <tr>
                    <td>${p.codigo}</td>
                    <td>${p.nombre}</td>
                    <td>${formatCurrency(p.precio)}</td>
                    <td>${p.stock}</td>
                    <td>${p.categoria}</td>
                    <td>
                        <button type="button" class="btn btn-sm btn-outline-primary btn-editar-producto" data-codigo="${p.codigo}" data-rol="administrador">Editar</button>
                        <button type="button" class="btn btn-sm btn-outline-danger btn-eliminar-producto" data-codigo="${p.codigo}" data-rol="administrador">Eliminar</button>
                    </td>
                </tr>
            `).join('');

            tablaAdminProductosBody.querySelectorAll('.btn-editar-producto').forEach(btn => {
                btn.addEventListener('click', () => cargarProductoEnFormulario(btn.dataset.codigo));
            });
            tablaAdminProductosBody.querySelectorAll('.btn-eliminar-producto').forEach(btn => {
                btn.addEventListener('click', () => {
                    if (!confirm('¿Eliminar este producto del catálogo?')) return;
                    saveProductos(getProductos().filter(p => p.codigo !== btn.dataset.codigo));
                    renderTablaAdminProductos();
                });
            });

            // Vuelve a ocultar los botones "solo administrador" si quien está logueado es Vendedor.
            if (typeof getSesion === 'function' && typeof aplicarMenuPorRol === 'function') {
                aplicarMenuPorRol(getSesion());
            }
        }

        function cargarProductoEnFormulario(codigo) {
            const producto = getProductos().find(p => p.codigo === codigo);
            if (!producto) return;

            codigoEnEdicion = codigo;
            document.getElementById('prodCodigo').value = producto.codigo;
            document.getElementById('prodCodigo').disabled = true;
            document.getElementById('prodNombre').value = producto.nombre;
            document.getElementById('prodDescripcion').value = producto.descripcion || '';
            document.getElementById('prodPrecio').value = producto.precio;
            document.getElementById('prodStock').value = producto.stock;
            document.getElementById('prodStockCritico').value = producto.stockCritico ?? '';
            document.getElementById('prodCategoria').value = producto.categoria;
            document.getElementById('tituloFormularioProducto').textContent = 'Editar producto';
            document.getElementById('panelFormularioProducto').classList.remove('d-none');
            document.getElementById('alertaStockCritico').classList.add('d-none');
        }

        const btnNuevoProducto = document.getElementById('btnNuevoProducto');
        if (btnNuevoProducto) {
            btnNuevoProducto.addEventListener('click', () => {
                codigoEnEdicion = null;
                document.getElementById('productoForm').reset();
                document.getElementById('prodCodigo').disabled = false;
                document.getElementById('tituloFormularioProducto').textContent = 'Nuevo producto';
                document.getElementById('alertaStockCritico').classList.add('d-none');
                document.getElementById('panelFormularioProducto').classList.remove('d-none');
            });
        }

        const btnCancelarProducto = document.getElementById('btnCancelarProducto');
        if (btnCancelarProducto) {
            btnCancelarProducto.addEventListener('click', () => {
                document.getElementById('panelFormularioProducto').classList.add('d-none');
            });
        }

        const formProducto = document.getElementById('productoForm');
        if (formProducto) {
            formProducto.addEventListener('submit', (event) => {
                event.preventDefault();

                const inputCodigo = document.getElementById('prodCodigo');
                const inputNombre = document.getElementById('prodNombre');
                const inputPrecio = document.getElementById('prodPrecio');
                const inputStock = document.getElementById('prodStock');
                const selectCategoria = document.getElementById('prodCategoria');
                const imagen = document.getElementById('prodImagen');

                const codigo = inputCodigo.value.trim();
                const nombre = inputNombre.value.trim();
                const descripcion = document.getElementById('prodDescripcion').value.trim();
                const precio = Number(inputPrecio.value);
                const stock = Number(inputStock.value);
                const stockCriticoValor = document.getElementById('prodStockCritico').value;
                const stockCritico = stockCriticoValor === '' ? null : Number(stockCriticoValor);
                const categoria = selectCategoria.value;

                // Limpia errores previos antes de validar de nuevo.
                [inputCodigo, inputNombre, inputPrecio, inputStock, selectCategoria].forEach(c => c.classList.remove('is-invalid'));
                ['prodCodigo', 'prodNombre', 'prodPrecio', 'prodStock', 'prodCategoria'].forEach(id => {
                    const errorEl = document.getElementById('error-' + id);
                    if (errorEl) errorEl.textContent = '';
                });

                let tieneErrores = false;
                function marcarErrorProducto(campo, mensaje) {
                    tieneErrores = true;
                    campo.classList.add('is-invalid');
                    const errorEl = document.getElementById('error-' + campo.id);
                    if (errorEl) errorEl.textContent = mensaje;
                }

                if (!codigo || codigo.length < 3) marcarErrorProducto(inputCodigo, 'El código debe tener al menos 3 caracteres.');
                if (!nombre || nombre.length > 100) marcarErrorProducto(inputNombre, 'El nombre es obligatorio (máx. 100 caracteres).');
                if (isNaN(precio) || precio < 0) marcarErrorProducto(inputPrecio, 'El precio debe ser 0 o mayor.');
                if (isNaN(stock) || stock < 0 || !Number.isInteger(stock)) marcarErrorProducto(inputStock, 'El stock debe ser un número entero igual o mayor a 0.');
                if (!categoria) marcarErrorProducto(selectCategoria, 'Debes seleccionar una categoría.');

                let productos = getProductos();

                if (!tieneErrores && !codigoEnEdicion && productos.some(p => p.codigo === codigo)) {
                    marcarErrorProducto(inputCodigo, 'Ya existe un producto con ese código.');
                }

                if (tieneErrores) {
                    const primerCampoInvalido = formProducto.querySelector('.is-invalid');
                    if (primerCampoInvalido) primerCampoInvalido.focus();
                    return;
                }

                if (codigoEnEdicion) {
                    productos = productos.map(p => p.codigo === codigoEnEdicion
                        ? { ...p, nombre, descripcion, precio, stock, stockCritico, categoria }
                        : p);
                } else {
                    productos.push({
                        codigo, nombre, descripcion, precio, stock, stockCritico, categoria,
                        imagen: (imagen && imagen.files.length) ? URL.createObjectURL(imagen.files[0]) : 'assets/img/logo.png'
                    });
                }

                saveProductos(productos);

                // ALERTA DE STOCK CRÍTICO (Prioridad 3).
                const alertaStock = document.getElementById('alertaStockCritico');
                if (alertaStock) {
                    if (stockCritico !== null && stock <= stockCritico) {
                        alertaStock.textContent = `⚠ Atención: el stock ingresado (${stock}) quedó igual o por debajo del stock crítico (${stockCritico}).`;
                        alertaStock.classList.remove('d-none');
                    } else {
                        alertaStock.classList.add('d-none');
                    }
                }

                renderTablaAdminProductos();
                if (!(alertaStock && !alertaStock.classList.contains('d-none'))) {
                    document.getElementById('panelFormularioProducto').classList.add('d-none');
                }
            });
        }

        renderTablaAdminProductos();
    }

    // --- admin-usuarios.html: mantenedor de usuarios (listar, crear, editar, eliminar) ---
    const tablaAdminUsuariosBody = document.getElementById('tablaAdminUsuariosBody');
    if (tablaAdminUsuariosBody) {
        let runEnEdicion = null;

        function renderTablaAdminUsuarios() {
            const usuarios = getUsuariosAdmin();
            const etiquetaTipo = { administrador: 'Administrador', vendedor: 'Vendedor', cliente: 'Cliente' };

            tablaAdminUsuariosBody.innerHTML = usuarios.map(u => `
                <tr>
                    <td>${u.run}</td>
                    <td>${u.nombre}</td>
                    <td>${u.apellidos}</td>
                    <td>${u.correo}</td>
                    <td>${etiquetaTipo[u.tipo] || u.tipo}</td>
                    <td>
                        <button type="button" class="btn btn-sm btn-outline-primary btn-editar-usuario" data-run="${u.run}">Editar</button>
                        <button type="button" class="btn btn-sm btn-outline-danger btn-eliminar-usuario" data-run="${u.run}">Eliminar</button>
                    </td>
                </tr>
            `).join('');

            tablaAdminUsuariosBody.querySelectorAll('.btn-editar-usuario').forEach(btn => {
                btn.addEventListener('click', () => cargarUsuarioEnFormulario(btn.dataset.run));
            });
            tablaAdminUsuariosBody.querySelectorAll('.btn-eliminar-usuario').forEach(btn => {
                btn.addEventListener('click', () => {
                    if (!confirm('¿Eliminar este usuario?')) return;
                    saveUsuariosAdmin(getUsuariosAdmin().filter(u => u.run !== btn.dataset.run));
                    renderTablaAdminUsuarios();
                });
            });
        }

        function cargarUsuarioEnFormulario(run) {
            const usuario = getUsuariosAdmin().find(u => u.run === run);
            if (!usuario) return;

            runEnEdicion = run;
            document.getElementById('userRun').value = usuario.run;
            document.getElementById('userRun').disabled = true;
            document.getElementById('userNombre').value = usuario.nombre;
            document.getElementById('userApellidos').value = usuario.apellidos;
            document.getElementById('userCorreo').value = usuario.correo;
            document.getElementById('userTipo').value = usuario.tipo;
            document.getElementById('userDireccion').value = usuario.direccion;

            const selectRegion = document.getElementById('regRegion');
            const selectComuna = document.getElementById('regComuna');
            if (selectRegion) {
                selectRegion.value = usuario.region || '';
                selectRegion.dispatchEvent(new Event('change'));
                setTimeout(() => {
                    if (selectComuna) selectComuna.value = usuario.comuna || '';
                }, 0);
            }

            document.getElementById('tituloFormularioUsuario').textContent = 'Editar usuario';
            document.getElementById('panelFormularioUsuario').classList.remove('d-none');
        }

        const btnNuevoUsuario = document.getElementById('btnNuevoUsuario');
        if (btnNuevoUsuario) {
            btnNuevoUsuario.addEventListener('click', () => {
                runEnEdicion = null;
                document.getElementById('usuarioForm').reset();
                document.getElementById('userRun').disabled = false;
                document.getElementById('tituloFormularioUsuario').textContent = 'Nuevo usuario';
                document.getElementById('panelFormularioUsuario').classList.remove('d-none');
            });
        }

        const btnCancelarUsuario = document.getElementById('btnCancelarUsuario');
        if (btnCancelarUsuario) {
            btnCancelarUsuario.addEventListener('click', () => {
                document.getElementById('panelFormularioUsuario').classList.add('d-none');
            });
        }

        const formUsuario = document.getElementById('usuarioForm');
        if (formUsuario) {
            formUsuario.addEventListener('submit', (event) => {
                event.preventDefault();

                const inputRun = document.getElementById('userRun');
                const inputNombre = document.getElementById('userNombre');
                const inputApellidos = document.getElementById('userApellidos');
                const inputCorreo = document.getElementById('userCorreo');
                const selectTipo = document.getElementById('userTipo');
                const inputDireccion = document.getElementById('userDireccion');
                const selectRegionForm = document.getElementById('regRegion');
                const selectComunaForm = document.getElementById('regComuna');

                const run = inputRun.value.trim().toUpperCase();
                const nombre = inputNombre.value.trim();
                const apellidos = inputApellidos.value.trim();
                const correo = inputCorreo.value.trim();
                const tipo = selectTipo.value;
                const direccion = inputDireccion.value.trim();
                const region = selectRegionForm ? selectRegionForm.value : '';
                const comuna = selectComunaForm ? selectComunaForm.value : '';

                // Limpia errores previos antes de validar de nuevo.
                [inputRun, inputNombre, inputApellidos, inputCorreo, selectTipo, inputDireccion].forEach(c => c.classList.remove('is-invalid'));
                ['userRun', 'userNombre', 'userApellidos', 'userCorreo', 'userTipo', 'userDireccion'].forEach(id => {
                    const errorEl = document.getElementById('error-' + id);
                    if (errorEl) errorEl.textContent = '';
                });

                let tieneErrores = false;
                function marcarErrorUsuario(campo, mensaje) {
                    tieneErrores = true;
                    campo.classList.add('is-invalid');
                    const errorEl = document.getElementById('error-' + campo.id);
                    if (errorEl) errorEl.textContent = mensaje;
                }

                // VALIDACIÓN DE RUN CHILENO (Prioridad 3).
                if (!esRunValido(run)) marcarErrorUsuario(inputRun, 'RUN inválido (sin puntos ni guion, ej: 19011022K).');
                if (!nombre || nombre.length > 50) marcarErrorUsuario(inputNombre, 'El nombre es obligatorio (máx. 50 caracteres).');
                if (!apellidos || apellidos.length > 100) marcarErrorUsuario(inputApellidos, 'Los apellidos son obligatorios (máx. 100 caracteres).');
                if (!correo || correo.length > 100) marcarErrorUsuario(inputCorreo, 'El correo es obligatorio (máx. 100 caracteres).');
                if (!tipo) marcarErrorUsuario(selectTipo, 'Debes seleccionar un tipo de usuario.');
                if (!direccion || direccion.length > 300) marcarErrorUsuario(inputDireccion, 'La dirección es obligatoria (máx. 300 caracteres).');

                let usuarios = getUsuariosAdmin();

                if (!tieneErrores && !runEnEdicion && usuarios.some(u => u.run === run)) {
                    marcarErrorUsuario(inputRun, 'Ya existe un usuario con ese RUN.');
                }

                if (tieneErrores) {
                    const primerCampoInvalido = formUsuario.querySelector('.is-invalid');
                    if (primerCampoInvalido) primerCampoInvalido.focus();
                    return;
                }

                if (runEnEdicion) {
                    usuarios = usuarios.map(u => u.run === runEnEdicion
                        ? { ...u, nombre, apellidos, correo, tipo, direccion, region, comuna }
                        : u);
                } else {
                    usuarios.push({ run, nombre, apellidos, correo, tipo, direccion, region, comuna });
                }

                saveUsuariosAdmin(usuarios);
                renderTablaAdminUsuarios();
                document.getElementById('panelFormularioUsuario').classList.add('d-none');
            });
        }

        renderTablaAdminUsuarios();
    }
});

// ============================================================================
// CORRECCIÓN — BOTONES QUE QUEDABAN SIN FUNCIÓN
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {

    // --- detalle-producto.html: arma la vista completa según el producto elegido (?codigo=PRD-001) ---
    function renderDetalleProducto() {
        const contenedorRelacionados = document.getElementById('detalleProductosRelacionados');
        if (!contenedorRelacionados) return; // esta página no es detalle-producto.html

        const productos = getProductos();
        const codigoUrl = new URLSearchParams(window.location.search).get('codigo');
        const producto = productos.find(p => p.codigo === codigoUrl) || productos[0];

        if (!producto) return;

        document.getElementById('detalleBreadcrumbNombre').textContent = producto.nombre;
        document.getElementById('detalleNombre').textContent = producto.nombre;
        document.getElementById('detallePrecio').textContent = formatCurrency(producto.precio);
        document.getElementById('detalleDescripcion').textContent = producto.descripcion || '';

        const imagenEl = document.getElementById('detalleImagen');
        imagenEl.src = producto.imagen;
        imagenEl.alt = producto.nombre;

        document.title = `${producto.nombre} - Hijos de las Ventas`;

        const btnAgregar = document.getElementById('btnAgregarDetalleProducto');
        if (btnAgregar) {
            btnAgregar.dataset.name = producto.nombre;
            btnAgregar.dataset.price = producto.precio;
        }

        // Productos relacionados: el resto del catálogo, excluyendo el que se está viendo.
        const relacionados = productos.filter(p => p.codigo !== producto.codigo);
        contenedorRelacionados.innerHTML = relacionados.map(p => `
            <div class="col-md-4">
                <article class="card h-100 shadow-sm border-0">
                    <a href="detalle-producto.html?codigo=${p.codigo}">
                        <img src="${p.imagen}" class="card-img-top" alt="${p.nombre}">
                    </a>
                    <div class="card-body text-center">
                        <h6 class="card-title fw-bold">${p.nombre}</h6>
                        <p class="text-primary fw-bold mb-2">${formatCurrency(p.precio)}</p>
                        <button type="button" class="btn btn-outline-primary btn-sm fw-bold add-to-cart-btn"
                                data-name="${p.nombre}" data-price="${p.precio}">Lo quiero</button>
                    </div>
                </article>
            </div>
        `).join('');

        // Re-enlaza los botones "Lo quiero" de las cards relacionadas recién creadas.
        contenedorRelacionados.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', () => {
                addToCart(button.dataset.name, button.dataset.price);
                const originalText = button.textContent;
                button.textContent = 'Agregado';
                button.classList.add('btn-success');
                button.classList.remove('btn-outline-primary');
                setTimeout(() => {
                    button.textContent = originalText;
                    button.classList.remove('btn-success');
                    button.classList.add('btn-outline-primary');
                }, 1000);
            });
        });
    }
    renderDetalleProducto();

    // --- detalle-producto.html: "Añadir al carrito" ahora respeta la cantidad elegida ---
    const btnAgregarDetalleProducto = document.getElementById('btnAgregarDetalleProducto');
    if (btnAgregarDetalleProducto) {
        btnAgregarDetalleProducto.addEventListener('click', () => {
            const selectCantidad = document.getElementById('cantidadProducto');
            const cantidad = selectCantidad ? Number(selectCantidad.value) : 1;

            const cart = getCart();
            const nombre = btnAgregarDetalleProducto.dataset.name;
            const precio = Number(btnAgregarDetalleProducto.dataset.price);
            const existente = cart.find(item => item.name === nombre);

            if (existente) {
                existente.quantity += cantidad;
            } else {
                cart.push({ name: nombre, price: precio, quantity: cantidad });
            }

            saveCart(cart);
            renderCart();
            renderContactCart();

            const textoOriginal = btnAgregarDetalleProducto.textContent;
            btnAgregarDetalleProducto.textContent = `Agregado (${cantidad})`;
            btnAgregarDetalleProducto.classList.add('btn-success');
            setTimeout(() => {
                btnAgregarDetalleProducto.textContent = textoOriginal;
                btnAgregarDetalleProducto.classList.remove('btn-success');
            }, 1200);
        });
    }

    // --- registro.html: el botón "Registrar" ahora valida, guarda el usuario y deja la sesión iniciada ---
    const formularioRegistro = document.getElementById('registroForm');
    if (formularioRegistro) {
        formularioRegistro.addEventListener('submit', (event) => {
            event.preventDefault();

            const campos = {
                run: document.getElementById('regRun'),
                nombre: document.getElementById('regNombre'),
                apellidos: document.getElementById('regApellidos'),
                correo: document.getElementById('regCorreo'),
                confirmarCorreo: document.getElementById('regConfirmarCorreo'),
                password: document.getElementById('regPassword'),
                confirmarPassword: document.getElementById('regConfirmarPassword'),
                region: document.getElementById('regRegion'),
                comuna: document.getElementById('regComuna'),
                direccion: document.getElementById('regDireccion')
            };

            let tieneErrores = false;

            Object.values(campos).forEach(campo => campo && campo.classList.remove('is-invalid'));
            document.querySelectorAll('#registroForm .error-msg').forEach(span => span.textContent = '');

            function marcarError(campo, mensaje) {
                tieneErrores = true;
                if (!campo) return;
                campo.classList.add('is-invalid');
                const errorEl = document.getElementById('error-' + campo.id);
                if (errorEl) errorEl.textContent = mensaje;
            }

            const dominioPermitidoRegex = /^[^\s@]+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/i;

            if (!campos.run.value.trim()) {
                marcarError(campos.run, 'El Run es obligatorio.');
            } else if (!esRunValido(campos.run.value.trim())) {
                marcarError(campos.run, 'Run inválido (sin puntos ni guion, ej: 19011022K).');
            }

            if (!campos.nombre.value.trim()) marcarError(campos.nombre, 'El nombre es obligatorio.');
            if (!campos.apellidos.value.trim()) marcarError(campos.apellidos, 'Los apellidos son obligatorios.');

            if (!campos.correo.value.trim()) {
                marcarError(campos.correo, 'El correo es obligatorio.');
            } else if (!dominioPermitidoRegex.test(campos.correo.value.trim())) {
                marcarError(campos.correo, 'Solo se aceptan correos @duoc.cl, @profesor.duoc.cl o @gmail.com.');
            } else if (campos.correo.value.trim().toLowerCase() !== campos.confirmarCorreo.value.trim().toLowerCase()) {
                marcarError(campos.confirmarCorreo, 'Los correos ingresados no coinciden.');
            }

            if (campos.password.value.length < 4 || campos.password.value.length > 10) {
                marcarError(campos.password, 'La contraseña debe tener entre 4 y 10 caracteres.');
            } else if (campos.password.value !== campos.confirmarPassword.value) {
                marcarError(campos.confirmarPassword, 'Las contraseñas no coinciden.');
            }

            if (!campos.region.value) marcarError(campos.region, 'Debes seleccionar una región.');
            if (!campos.comuna.value) marcarError(campos.comuna, 'Debes seleccionar una comuna.');
            if (!campos.direccion.value.trim()) marcarError(campos.direccion, 'La dirección es obligatoria.');

            if (tieneErrores) {
                const primerCampoInvalido = formularioRegistro.querySelector('.is-invalid');
                if (primerCampoInvalido) primerCampoInvalido.focus();
                return;
            }

            // Guarda al nuevo cliente para que también aparezca en el mantenedor de usuarios del admin.
            const nuevoUsuario = {
                run: campos.run.value.trim().toUpperCase(),
                nombre: campos.nombre.value.trim(),
                apellidos: campos.apellidos.value.trim(),
                correo: campos.correo.value.trim(),
                tipo: 'cliente',
                direccion: campos.direccion.value.trim(),
                region: campos.region.value,
                comuna: campos.comuna.value
            };

            const usuarios = getUsuariosAdmin();
            if (usuarios.some(u => u.run === nuevoUsuario.run)) {
                alert('Ya existe un usuario registrado con ese Run.');
                return;
            }
            usuarios.push(nuevoUsuario);
            saveUsuariosAdmin(usuarios);

            // Deja al usuario recién registrado con la sesión iniciada (rol Cliente) y lo lleva a la tienda.
            if (typeof iniciarSesion === 'function') {
                iniciarSesion(nuevoUsuario.correo, campos.password.value);
            }

            alert('¡Registro exitoso! Ya puedes comprar en la tienda.');
            window.location.href = 'index.html';
        });
    }
});
