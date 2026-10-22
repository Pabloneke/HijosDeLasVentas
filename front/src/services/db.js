// front/src/services/db.js
// Base de datos simulada sobre localStorage (no hay backend en esta fase).
// Cada "tabla" es un arreglo JSON guardado bajo una clave.

const PRODUCTOS_KEY = 'productos';
const USUARIOS_KEY = 'usuarios';
const SESION_KEY = 'sesion';
const ORDENES_KEY = 'ordenes';

// Usamos tus imágenes reales de la carpeta public/img
// stockCritico: si stock <= stockCritico se muestra la alerta de stock crítico (RF5).
const productosBase = [
    { id: 1, name: "Perfume Rasasi Hawas", price: 65000, category: "Perfumería", image: "/img/RasasiHawas.webp", stock: 12, stockCritico: 3 },
    { id: 2, name: "MousePad XXL Gamer", price: 15000, category: "Computación", image: "/img/MousePadXXL.webp", stock: 25, stockCritico: 5 },
    { id: 3, name: "Teclado Mecánico RGB", price: 45000, category: "Computación", image: "/img/Teclado.webp", stock: 4, stockCritico: 5 },
    { id: 4, name: "Juego PS4", price: 20000, category: "Gaming", image: "/img/PS14.webp", stock: 8, stockCritico: 3 },
    { id: 5, name: "GTA VI (Pre-venta)", price: 70000, category: "Gaming", image: "/img/GTA-VI.webp", stock: 50, stockCritico: 10 },
    { id: 6, name: "Manga Dorohedoro Vol. 1", price: 12000, category: "Librería", image: "/img/Dorohedoro1.webp", stock: 2, stockCritico: 2 }
];

// Usuarios de prueba (simulación sin backend: las contraseñas se guardan en texto plano
// solo porque esto es una demo; un sistema real nunca debe hacerlo).
// tipo: administrador | vendedor | cliente. Los administradores y vendedores solo existen
// aquí: el formulario de registro público siempre crea clientes.
const usuariosBase = [
    { id: 1, run: '190110222', nombre: 'Paulo', apellidos: 'Catalán', correo: 'admin@duoc.cl', password: 'admin123', tipo: 'administrador', direccion: 'Av. Siempre Viva 123', region: 'Región Metropolitana de Santiago', comuna: 'Santiago' },
    { id: 2, run: '182345679', nombre: 'Mauricio', apellidos: 'Ahumada', correo: 'vendedor@duoc.cl', password: 'vende123', tipo: 'vendedor', direccion: 'Calle Los Alerces 456', region: 'Región del Biobío', comuna: 'Concepción' },
    { id: 3, run: '20987654K', nombre: 'Carla', apellidos: 'Gómez', correo: 'carla@gmail.com', password: 'cliente123', tipo: 'cliente', direccion: 'Pasaje Las Rosas 789', region: 'Región de Valparaíso', comuna: 'Viña del Mar' }
];

// ---------- Utilidades internas ----------

// Lee un arreglo guardado; si no existe o el JSON está dañado devuelve []
const leerLista = (clave) => {
    try {
        const data = JSON.parse(localStorage.getItem(clave));
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
};

const guardarLista = (clave, lista) => {
    localStorage.setItem(clave, JSON.stringify(lista));
};

// Siguiente id: el mayor existente + 1 (evita reutilizar ids de registros eliminados al final)
const siguienteId = (lista) => lista.reduce((max, item) => Math.max(max, item.id), 0) + 1;

// Función para inicializar la BD en el navegador (la usa main.jsx antes de montar la app)
export const initDB = () => {
    if (!localStorage.getItem(PRODUCTOS_KEY)) {
        guardarLista(PRODUCTOS_KEY, productosBase);
    }
    if (!localStorage.getItem(USUARIOS_KEY)) {
        guardarLista(USUARIOS_KEY, usuariosBase);
    }
};

// Función para traer los productos (la usa Productos.jsx)
export const getProducts = () => {
    const data = localStorage.getItem(PRODUCTOS_KEY);
    return data ? JSON.parse(data) : [];
};

// RF5: un producto tiene stock crítico cuando su stock es menor o igual al umbral definido
export const isStockCritico = (producto) => producto.stock <= producto.stockCritico;

// ---------- Usuarios ----------

export const getUsers = () => leerLista(USUARIOS_KEY);

export const getUserById = (id) =>
    getUsers().find((u) => u.id === Number(id)) ?? null;

// Busca por correo sin distinguir mayúsculas (null si no existe)
export const findUserByEmail = (correo) =>
    getUsers().find((u) => u.correo.toLowerCase() === String(correo).trim().toLowerCase()) ?? null;

// Crear: el correo debe ser único. Lanza Error si ya está registrado.
export const createUser = (datos) => {
    if (findUserByEmail(datos.correo)) {
        throw new Error('El correo ya está registrado');
    }
    const usuarios = getUsers();
    const nuevo = { tipo: 'cliente', ...datos, id: siguienteId(usuarios) };
    guardarLista(USUARIOS_KEY, [...usuarios, nuevo]);
    return nuevo;
};

// Actualizar: null si no existe; lanza Error si el nuevo correo ya lo usa otro usuario
export const updateUser = (id, cambios) => {
    const usuarios = getUsers();
    const indice = usuarios.findIndex((u) => u.id === Number(id));
    if (indice === -1) return null;

    if (cambios.correo) {
        const otro = findUserByEmail(cambios.correo);
        if (otro && otro.id !== usuarios[indice].id) {
            throw new Error('El correo ya está registrado');
        }
    }
    const actualizado = { ...usuarios[indice], ...cambios, id: usuarios[indice].id };
    usuarios[indice] = actualizado;
    guardarLista(USUARIOS_KEY, usuarios);
    return actualizado;
};

export const deleteUser = (id) => {
    const usuarios = getUsers();
    const restantes = usuarios.filter((u) => u.id !== Number(id));
    if (restantes.length === usuarios.length) return false;
    guardarLista(USUARIOS_KEY, restantes);
    return true;
};

// ---------- Sesión ----------

// Sesión actual guardada (sin contraseña) o null si nadie inició sesión
export const getSession = () => {
    try {
        return JSON.parse(localStorage.getItem(SESION_KEY));
    } catch {
        return null;
    }
};

// Valida correo y contraseña contra los usuarios guardados. Lanza Error si no coinciden.
export const login = (correo, password) => {
    const usuario = findUserByEmail(correo);
    if (!usuario || usuario.password !== password) {
        throw new Error('Correo o contraseña incorrectos');
    }
    const sesion = { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, tipo: usuario.tipo };
    localStorage.setItem(SESION_KEY, JSON.stringify(sesion));
    return sesion;
};

export const logout = () => localStorage.removeItem(SESION_KEY);

// ---------- Órdenes de compra ----------
// Una orden guarda lo que se compró: { id, fecha, cliente: { userId, nombre, correo }, items, total }
// cliente.userId es null si compró sin sesión iniciada.

export const getOrders = () => leerLista(ORDENES_KEY);

// Crear: asigna id consecutivo y fecha actual; devuelve la orden creada
export const createOrder = (datos) => {
    const ordenes = getOrders();
    const nueva = { ...datos, id: siguienteId(ordenes), fecha: new Date().toISOString() };
    guardarLista(ORDENES_KEY, [...ordenes, nueva]);
    return nueva;
};
