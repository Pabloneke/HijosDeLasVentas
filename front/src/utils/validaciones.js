// Validaciones de formularios (RF3). Migradas desde funciones.js de la versión HTML.
// Las funciones es* devuelven true/false; las validar* devuelven un objeto con un mensaje
// por cada campo inválido (objeto vacío = formulario válido).

const DOMINIOS_PERMITIDOS = ['duoc.cl', 'profesor.duoc.cl', 'gmail.com'];

// Texto con forma de correo: texto@texto.dominio
export const esEmailValido = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Solo se aceptan los dominios autorizados por el negocio
export const esDominioPermitido = (email) =>
    DOMINIOS_PERMITIDOS.includes(email.split('@')[1]?.toLowerCase().trim());

// Solo letras y espacios (con tildes y ñ), largo entre 3 y 100
export const esNombreValido = (nombre) =>
    /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre) && nombre.length >= 3 && nombre.length <= 100;

// Contraseña de 4 a 10 caracteres
export const esPasswordValida = (password) => password.length >= 4 && password.length <= 10;

// RUN chileno sin puntos ni guion (ej: 123456785), largo 7 a 9, con dígito verificador (módulo 11)
export const esRunValido = (run) => {
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
        multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }

    const resto = 11 - (suma % 11);
    let dvEsperado;
    if (resto === 11) dvEsperado = '0';
    else if (resto === 10) dvEsperado = 'K';
    else dvEsperado = String(resto);

    return dv === dvEsperado;
};

// Mensaje de error del correo ('' si es válido)
const errorCorreo = (correo) => {
    if (!correo.trim()) return 'Ingresa tu correo';
    if (!esEmailValido(correo)) return 'El correo no tiene un formato válido';
    if (!esDominioPermitido(correo)) return 'Solo se permiten correos @duoc.cl, @profesor.duoc.cl o @gmail.com';
    return '';
};

const errorPassword = (password) =>
    esPasswordValida(password) ? '' : 'La contraseña debe tener entre 4 y 10 caracteres';

// Quita del objeto los campos sin error
const soloErrores = (errores) =>
    Object.fromEntries(Object.entries(errores).filter(([, mensaje]) => mensaje));

export const validarLogin = ({ correo, password }) =>
    soloErrores({ correo: errorCorreo(correo), password: errorPassword(password) });

export const validarRegistro = (datos) =>
    soloErrores({
        run: esRunValido(datos.run) ? '' : 'RUN inválido: sin puntos ni guion y con dígito verificador (7 a 9 caracteres)',
        nombre: esNombreValido(datos.nombre) ? '' : 'El nombre solo admite letras y espacios (3 a 100 caracteres)',
        apellidos: esNombreValido(datos.apellidos) ? '' : 'Los apellidos solo admiten letras y espacios (3 a 100 caracteres)',
        correo: errorCorreo(datos.correo),
        password: errorPassword(datos.password),
        confirmar: datos.confirmar === datos.password ? '' : 'Las contraseñas no coinciden',
        region: datos.region ? '' : 'Selecciona una región',
        comuna: datos.comuna ? '' : 'Selecciona una comuna',
        direccion: datos.direccion.trim() && datos.direccion.length <= 300 ? '' : 'Ingresa tu dirección (máximo 300 caracteres)',
    });

// Mantenedor de productos (admin). Los campos numéricos llegan como texto desde los inputs.
// El stock crítico es opcional: vacío equivale a 0.
export const validarProducto = (datos) => {
    const precio = String(datos.price).trim();
    const stock = String(datos.stock).trim();
    const critico = String(datos.stockCritico ?? '').trim();
    const entero = (texto) => /^\d+$/.test(texto);

    return soloErrores({
        name: datos.name.trim() && datos.name.trim().length <= 100 ? '' : 'El nombre es obligatorio (máximo 100 caracteres)',
        price: precio !== '' && Number(precio) >= 0 ? '' : 'El precio debe ser 0 o mayor',
        stock: entero(stock) ? '' : 'El stock debe ser un número entero igual o mayor a 0',
        stockCritico: critico === '' || entero(critico) ? '' : 'El stock crítico debe ser un número entero igual o mayor a 0',
        category: datos.category ? '' : 'Debes seleccionar una categoría',
    });
};

// Mantenedor de usuarios (admin). Al editar, la contraseña es opcional: vacía = no se cambia.
export const validarUsuarioAdmin = (datos, { editando = false } = {}) =>
    soloErrores({
        run: esRunValido(datos.run) ? '' : 'RUN inválido: sin puntos ni guion y con dígito verificador (7 a 9 caracteres)',
        nombre: esNombreValido(datos.nombre) ? '' : 'El nombre solo admite letras y espacios (3 a 100 caracteres)',
        apellidos: esNombreValido(datos.apellidos) ? '' : 'Los apellidos solo admiten letras y espacios (3 a 100 caracteres)',
        correo: errorCorreo(datos.correo),
        password: editando && !datos.password ? '' : errorPassword(datos.password),
        tipo: datos.tipo ? '' : 'Debes seleccionar un tipo de usuario',
        region: datos.region ? '' : 'Selecciona una región',
        comuna: datos.comuna ? '' : 'Selecciona una comuna',
        direccion: datos.direccion.trim() && datos.direccion.length <= 300 ? '' : 'La dirección es obligatoria (máximo 300 caracteres)',
    });

// Checkout de demostración: la dirección y región/comuna solo se exigen si la entrega es a domicilio.
// La tarjeta se valida únicamente para mantener compatibilidad con formularios antiguos que la envíen;
// el checkout actual no solicita ni procesa datos de pago.
export const validarCheckout = (datos) => soloErrores({
        nombre: esNombreValido(datos.nombre) ? '' : 'El nombre solo admite letras y espacios (3 a 100 caracteres)',
        correo: errorCorreo(datos.correo),
        region: datos.entrega !== 'despacho' || datos.region ? '' : 'Selecciona una región',
        comuna: datos.entrega !== 'despacho' || datos.comuna ? '' : 'Selecciona una comuna',
        direccion: datos.entrega !== 'despacho' || datos.direccion.trim() ? '' : 'Ingresa la dirección de despacho',
        ...(Object.prototype.hasOwnProperty.call(datos, 'tarjeta')
            ? { tarjeta: /^\d{16}$/.test(datos.tarjeta.replace(/\s/g, '')) ? '' : 'Ingresa los 16 dígitos de tu tarjeta' }
            : {}),
    });
