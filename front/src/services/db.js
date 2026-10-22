// front/src/services/db.js

// Usamos tus imágenes reales de la carpeta public/img
const productosBase = [
    { id: 1, name: "Perfume Rasasi Hawas", price: 65000, category: "Perfumería", image: "/img/RasasiHawas.webp" },
    { id: 2, name: "MousePad XXL Gamer", price: 15000, category: "Computación", image: "/img/MousePadXXL.webp" },
    { id: 3, name: "Teclado Mecánico RGB", price: 45000, category: "Computación", image: "/img/Teclado.webp" },
    { id: 4, name: "Juego PS4", price: 20000, category: "Gaming", image: "/img/PS14.webp" },
    { id: 5, name: "GTA VI (Pre-venta)", price: 70000, category: "Gaming", image: "/img/GTA-VI.webp" },
    { id: 6, name: "Manga Dorohedoro Vol. 1", price: 12000, category: "Librería", image: "/img/Dorohedoro1.webp" }
];

// Función para inicializar la BD en el navegador (la usa App.jsx)
export const initDB = () => {
    if (!localStorage.getItem('productos')) {
        localStorage.setItem('productos', JSON.stringify(productosBase));
    }
};

// Función para traer los productos (la usa Productos.jsx)
export const getProducts = () => {
    const data = localStorage.getItem('productos');
    return data ? JSON.parse(data) : [];
};