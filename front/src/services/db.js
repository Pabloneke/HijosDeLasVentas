/**
 * db.js — "Base de datos" simulada sobre localStorage.
 *
 * Colecciones: productos, usuarios, ordenes.
 * Cada colección expone el mismo CRUD:
 *   getAll()            -> array con todos los registros
 *   getById(id)         -> registro o null
 *   create(data)        -> registro creado (con id asignado)
 *   update(id, cambios) -> registro actualizado (o null si no existe)
 *   remove(id)          -> true si borró, false si no existía
 *
 * Todo cambio se escribe en localStorage al instante y avisa a los
 * suscriptores (subscribe), así la UI de React puede refrescarse en tiempo real,
 * incluso entre pestañas distintas.
 *
 * Uso:
 *   import { productos, usuarios, ordenes } from './services/db';
 *   const lista = productos.getAll();
 *   productos.create({ codigo: 'P-100', nombre: 'Mouse', precio: 9990, stock: 5, categoria: 'Computación' });
 */

// ───────────────────────── Almacenamiento ─────────────────────────

const PREFIX = 'hijosVentas:';
const CHANGE_EVENT = 'db:change';

// Si localStorage no está disponible (modo privado, tests en Node), se usa memoria.
const memoria = new Map();

function storageDisponible() {
  try {
    const k = '__test__';
    window.localStorage.setItem(k, '1');
    window.localStorage.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

const usaLocalStorage = typeof window !== 'undefined' && storageDisponible();

function leer(clave) {
  try {
    const raw = usaLocalStorage ? window.localStorage.getItem(PREFIX + clave) : memoria.get(clave);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null; // JSON corrupto: se trata como colección vacía
  }
}

function escribir(clave, datos) {
  const raw = JSON.stringify(datos);
  if (usaLocalStorage) window.localStorage.setItem(PREFIX + clave, raw);
  else memoria.set(clave, raw);
}

// ───────────────────────── Suscripción (tiempo real) ─────────────────────────

const oyentes = new Set(); // en memoria, para notificaciones sin window (tests)

function notificar(coleccion) {
  oyentes.forEach((fn) => fn(coleccion));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail: { coleccion } }));
  }
}

/**
 * Llama a `callback(nombreColeccion)` cada vez que cambia una colección,
 * ya sea en esta pestaña o en otra. Devuelve la función para cancelar.
 *
 *   useEffect(() => subscribe(() => setLista(productos.getAll())), []);
 */
export function subscribe(callback) {
  oyentes.add(callback);

  const onStorage = (e) => {
    if (e.key && e.key.startsWith(PREFIX)) callback(e.key.slice(PREFIX.length));
  };
  if (typeof window !== 'undefined') window.addEventListener('storage', onStorage);

  return () => {
    oyentes.delete(callback);
    if (typeof window !== 'undefined') window.removeEventListener('storage', onStorage);
  };
}

// ───────────────────────── Fábrica de colecciones CRUD ─────────────────────────

function crearColeccion(nombre, { semilla = [], alCrear = (d) => d, validar = () => {} } = {}) {
  // Siembra datos iniciales sólo la primera vez.
  if (leer(nombre) === null) escribir(nombre, semilla);

  const getAll = () => leer(nombre) ?? [];

  const guardar = (lista) => {
    escribir(nombre, lista);
    notificar(nombre);
  };

  const siguienteId = (lista) => lista.reduce((max, r) => Math.max(max, Number(r.id) || 0), 0) + 1;

  return {
    getAll,

    getById(id) {
      return getAll().find((r) => String(r.id) === String(id)) ?? null;
    },

    create(data) {
      const lista = getAll();
      validar(data, lista, null);
      const nuevo = alCrear({ ...data, id: siguienteId(lista) }, lista);
      guardar([...lista, nuevo]);
      return nuevo;
    },

    update(id, cambios) {
      const lista = getAll();
      const i = lista.findIndex((r) => String(r.id) === String(id));
      if (i === -1) return null;
      validar({ ...lista[i], ...cambios }, lista, lista[i].id);
      // El id nunca se pisa, aunque venga en `cambios`.
      const actualizado = { ...lista[i], ...cambios, id: lista[i].id };
      lista[i] = actualizado;
      guardar(lista);
      return actualizado;
    },

    remove(id) {
      const lista = getAll();
      const resto = lista.filter((r) => String(r.id) !== String(id));
      if (resto.length === lista.length) return false;
      guardar(resto);
      return true;
    },

    /** Borra todos los registros de la colección. */
    clear() {
      guardar([]);
    },
  };
}

// ───────────────────────── Datos semilla ─────────────────────────

const SEMILLA_PRODUCTOS = [
  { id: 1, codigo: 'COM-001', nombre: 'Teclado mecánico', descripcion: 'Teclado mecánico retroiluminado.', precio: 39990, stock: 15, stockCritico: 5, categoria: 'Computación', imagen: '/img/Teclado.webp', oferta: false },
  { id: 2, codigo: 'COM-002', nombre: 'Mousepad gamer XXL', descripcion: 'Superficie amplia para mouse y teclado.', precio: 12990, stock: 30, stockCritico: 8, categoria: 'Computación', imagen: '/img/MousePadXXL.webp', oferta: true },
  { id: 3, codigo: 'COM-003', nombre: 'PlayStation 5', descripcion: 'Consola de última generación.', precio: 549990, stock: 4, stockCritico: 5, categoria: 'Computación', imagen: '/img/PS14.webp', oferta: false },
  { id: 4, codigo: 'PER-001', nombre: 'Rasasi Hawas', descripcion: 'Perfume masculino fresco y acuático.', precio: 59990, stock: 10, stockCritico: 3, categoria: 'Perfumería', imagen: '/img/RasasiHawas.webp', oferta: true },
  { id: 5, codigo: 'ALM-001', nombre: 'Dorohedoro Vol. 1', descripcion: 'Manga, tomo 1.', precio: 11990, stock: 20, stockCritico: 5, categoria: 'Almacén', imagen: '/img/Dorohedoro1.webp', oferta: false },
  { id: 6, codigo: 'ALM-002', nombre: 'GTA VI (reserva)', descripcion: 'Videojuego en reserva.', precio: 69990, stock: 50, stockCritico: 10, categoria: 'Almacén', imagen: '/img/GTA-VI.webp', oferta: false },
];

// Mismos usuarios demo que tenía auth.js en la versión HTML.
const SEMILLA_USUARIOS = [
  { id: 1, run: '19011022K', nombre: 'Paulo', apellidos: 'Catalán', correo: 'admin@duoc.cl', password: 'admin123', tipo: 'administrador', telefono: '', region: 'Región Metropolitana de Santiago', comuna: 'Santiago', direccion: 'Av. Siempre Viva 123' },
  { id: 2, run: '18022033K', nombre: 'Mauricio', apellidos: 'Ahumada', correo: 'vendedor@duoc.cl', password: 'vende123', tipo: 'vendedor', telefono: '', region: 'Región Metropolitana de Santiago', comuna: 'Providencia', direccion: 'Calle Falsa 456' },
];

// ───────────────────────── Colecciones ─────────────────────────

/**
 * Producto: { id, codigo, nombre, descripcion, precio, stock, stockCritico,
 *             categoria, imagen, oferta }
 */
export const productos = {
  ...crearColeccion('productos', {
    semilla: SEMILLA_PRODUCTOS,
    validar(p, lista, idActual) {
      if (!p.nombre || !String(p.nombre).trim()) throw new Error('El producto necesita un nombre.');
      if (Number(p.precio) < 0 || Number.isNaN(Number(p.precio))) throw new Error('Precio inválido.');
      if (Number(p.stock) < 0 || Number.isNaN(Number(p.stock))) throw new Error('Stock inválido.');
      if (p.codigo && lista.some((x) => x.codigo === p.codigo && x.id !== idActual)) {
        throw new Error(`Ya existe un producto con el código ${p.codigo}.`);
      }
    },
    alCrear: (p) => ({
      descripcion: '',
      stockCritico: 0,
      imagen: '',
      oferta: false,
      ...p,
      precio: Number(p.precio),
      stock: Number(p.stock),
    }),
  }),
};
// Consultas útiles que el resto del equipo va a necesitar.
productos.getByCategoria = (categoria) => productos.getAll().filter((p) => p.categoria === categoria);
productos.getOfertas = () => productos.getAll().filter((p) => p.oferta);
productos.getCriticos = () => productos.getAll().filter((p) => p.stock <= p.stockCritico);

/**
 * Usuario: { id, run, nombre, apellidos, correo, password, tipo
 *            ('administrador' | 'vendedor' | 'cliente'), telefono, region, comuna, direccion }
 * Nota: la contraseña se guarda en texto plano porque es una simulación sin backend.
 */
export const usuarios = {
  ...crearColeccion('usuarios', {
    semilla: SEMILLA_USUARIOS,
    validar(u, lista, idActual) {
      if (!u.correo || !String(u.correo).includes('@')) throw new Error('Correo inválido.');
      const repetido = lista.some(
        (x) => x.correo.toLowerCase() === String(u.correo).toLowerCase() && x.id !== idActual
      );
      if (repetido) throw new Error('Ya existe un usuario con ese correo.');
    },
    alCrear: (u) => ({ tipo: 'cliente', telefono: '', ...u }),
  }),
};
usuarios.getByCorreo = (correo) =>
  usuarios.getAll().find((u) => u.correo.toLowerCase() === String(correo).toLowerCase()) ?? null;

/**
 * Orden: { id, numero, usuarioId, cliente: {nombre, apellidos, correo},
 *          direccion: {calle, departamento, region, comuna, indicaciones},
 *          items: [{ productoId, nombre, precio, cantidad }],
 *          total, estado ('pendiente' | 'pagada' | 'rechazada'), fecha }
 * `numero`, `fecha`, `total` y `estado` se calculan solos si no vienen.
 */
export const ordenes = {
  ...crearColeccion('ordenes', {
    semilla: [],
    validar(o) {
      if (!Array.isArray(o.items) || o.items.length === 0) throw new Error('La orden necesita al menos un producto.');
    },
    alCrear(o) {
      const total = o.items.reduce((s, i) => s + Number(i.precio) * Number(i.cantidad), 0);
      return {
        usuarioId: null,
        estado: 'pendiente',
        fecha: new Date().toISOString(),
        ...o,
        numero: o.numero ?? `${new Date().getFullYear()}${String(o.id).padStart(4, '0')}`,
        total,
      };
    },
  }),
};
ordenes.getByUsuario = (usuarioId) => ordenes.getAll().filter((o) => String(o.usuarioId) === String(usuarioId));

// ───────────────────────── Utilidades ─────────────────────────

/** Vuelve todo a los datos semilla (útil en desarrollo y en tests). */
export function resetDb() {
  escribir('productos', SEMILLA_PRODUCTOS);
  escribir('usuarios', SEMILLA_USUARIOS);
  escribir('ordenes', []);
  ['productos', 'usuarios', 'ordenes'].forEach(notificar);
}

const db = { productos, usuarios, ordenes, subscribe, resetDb };
export default db;
