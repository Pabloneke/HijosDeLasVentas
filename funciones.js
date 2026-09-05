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
            }

            // Validar Correo electrónico
            if (!inputEmail || inputEmail.value.trim() === '') {
                tieneErrores = true;
                camposVacios.push('Correo electrónico');
                inputEmail.classList.add('is-invalid');
                if (errorEmail) errorEmail.textContent = 'El correo electrónico es obligatorio.';
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