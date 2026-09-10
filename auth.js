// SESIÓN SIMULADA: clave utilizada para guardar el usuario "logueado" en localStorage.
// (Mismo patrón que CART_KEY en funciones.js)
const SESION_KEY = 'loQuieresSesion';

// USUARIOS DE PRUEBA: como el proyecto todavía no tiene backend ni base de datos,
// se define una pequeña lista de usuarios de ejemplo para simular los 3 roles del
// sistema (Administrador, Vendedor y Cliente) — ver "Roles asociados al sistema" en el Anexo 1.
// Cualquier otro correo/contraseña válidos que no estén en esta lista se registra como Cliente.
const USUARIOS_DEMO = [
    { correo: 'admin@duoc.cl', password: 'admin123', tipo: 'administrador', nombre: 'Paulo Catalán' },
    { correo: 'vendedor@duoc.cl', password: 'vende123', tipo: 'vendedor', nombre: 'Mauricio Ahumada' }
];

// INICIAR SESIÓN: busca el usuario en la lista demo; si no existe, se asume rol Cliente.
function iniciarSesion(correo, password) {
    const encontrado = USUARIOS_DEMO.find(u =>
        u.correo.toLowerCase() === correo.toLowerCase() && u.password === password
    );

    const usuario = encontrado
        ? { correo: encontrado.correo, tipo: encontrado.tipo, nombre: encontrado.nombre }
        : { correo: correo, tipo: 'cliente', nombre: correo.split('@')[0] };

    localStorage.setItem(SESION_KEY, JSON.stringify(usuario));
    return usuario;
}

// OBTENER SESIÓN ACTUAL: retorna el usuario logueado o null si no hay sesión activa.
function getSesion() {
    try {
        return JSON.parse(localStorage.getItem(SESION_KEY));
    } catch (error) {
        return null;
    }
}

// CERRAR SESIÓN: elimina el usuario guardado y vuelve al login.
function cerrarSesion() {
    localStorage.removeItem(SESION_KEY);
    window.location.href = 'login.html';
}

// PROTEGER VISTA ADMINISTRADOR: se llama al cargar cada página del panel admin.
// rolesPermitidos: arreglo con los roles que pueden ver ESA página en particular,
// ej: ['administrador'] o ['administrador', 'vendedor'].
function protegerVistaAdmin(rolesPermitidos) {
    const sesion = getSesion();

    // Sin sesión iniciada -> redirige a login.
    if (!sesion) {
        window.location.href = 'login.html';
        return null;
    }

    // El Cliente jamás puede entrar al panel administrador (Anexo 1: "Cliente: Solo puede acceder a la tienda").
    if (sesion.tipo === 'cliente') {
        window.location.href = 'index.html';
        return null;
    }

    // Rol autenticado pero sin permiso para esta vista puntual (ej: Vendedor intentando editar usuarios).
    if (rolesPermitidos && !rolesPermitidos.includes(sesion.tipo)) {
        alert('No tienes permisos para acceder a esta sección.');
        window.location.href = 'admin-home.html';
        return null;
    }

    return sesion;
}

// APLICAR MENÚ SEGÚN EL ROL: oculta del menú lateral y de las tablas los accesos que
// el Vendedor no debe ver (Anexo 1: "Todos los demás accesos no deben aparecer en la vista del vendedor").
function aplicarMenuPorRol(sesion) {
    if (!sesion) return;

    if (sesion.tipo === 'vendedor') {
        document.querySelectorAll('[data-rol="administrador"]').forEach(el => el.remove());
    }

    const nombreUsuario = document.getElementById('nombreUsuarioSesion');
    if (nombreUsuario) {
        nombreUsuario.textContent = `${sesion.nombre} (${sesion.tipo})`;
    }
}
