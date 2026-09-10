// ARREGLO DE REGIONES Y COMUNAS: usado en registro.html y en los formularios de usuario del administrador.
const REGIONES = {
    "Región Metropolitana de Santiago": ["Santiago", "Providencia", "Ñuñoa", "Maipú"],
    "Región de Valparaíso": ["Valparaíso", "Viña del Mar", "Quilpué"],
    "Región del Biobío": ["Concepción", "Talcahuano", "Chiguayante"],
    "Región de Ñuble": ["Chillán", "San Carlos"],
    "Región de la Araucanía": ["Temuco", "Padre Las Casas"]
};

// INICIALIZA LOS SELECT DE REGIÓN Y COMUNA: se usa en cualquier página que tenga #regRegion / #regComuna.
document.addEventListener('DOMContentLoaded', () => {
    const selectRegion = document.getElementById('regRegion');
    const selectComuna = document.getElementById('regComuna');

    if (!selectRegion || !selectComuna) return;

    // Llenar el select de regiones a partir del arreglo.
    Object.keys(REGIONES).forEach(region => {
        const option = document.createElement('option');
        option.value = region;
        option.textContent = region;
        selectRegion.appendChild(option);
    });

    // Al cambiar la región, se actualiza la lista de comunas disponibles.
    selectRegion.addEventListener('change', () => {
        const comunas = REGIONES[selectRegion.value] || [];
        selectComuna.innerHTML = '<option value="" disabled selected>-- Seleccione la comuna --</option>';
        comunas.forEach(comuna => {
            const option = document.createElement('option');
            option.value = comuna;
            option.textContent = comuna;
            selectComuna.appendChild(option);
        });
        selectComuna.disabled = comunas.length === 0;
    });
});
