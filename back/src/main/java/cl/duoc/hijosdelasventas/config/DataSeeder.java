package cl.duoc.hijosdelasventas.config;

import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import cl.duoc.hijosdelasventas.model.Categoria;
import cl.duoc.hijosdelasventas.model.Producto;
import cl.duoc.hijosdelasventas.model.Usuario;
import cl.duoc.hijosdelasventas.model.Usuario.Rol;
import cl.duoc.hijosdelasventas.repository.CategoriaRepository;
import cl.duoc.hijosdelasventas.repository.ProductoRepository;
import cl.duoc.hijosdelasventas.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;

// Carga los datos iniciales (los mismos que tenía el front en db.js) solo si la base está vacía
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {
    private final CategoriaRepository categorias;
    private final ProductoRepository productos;
    private final UsuarioRepository usuarios;

    @Override
    public void run(String... args) {
        if (categorias.count() > 0) return;

        var computacion = categorias.save(new Categoria(null, "Computación"));
        var gaming = categorias.save(new Categoria(null, "Gaming"));
        var libreria = categorias.save(new Categoria(null, "Librería"));
        var perfumeria = categorias.save(new Categoria(null, "Perfumería"));

        productos.saveAll(List.of(
            new Producto(null, "Perfume Rasasi Hawas", 65000, 12, 3, "/img/RasasiHawas.webp", perfumeria),
            new Producto(null, "MousePad XXL Gamer", 15000, 25, 5, "/img/MousePadXXL.webp", computacion),
            new Producto(null, "Teclado Mecánico RGB", 45000, 4, 5, "/img/Teclado.webp", computacion),
            new Producto(null, "Juego PS4", 20000, 8, 3, "/img/PS14.webp", gaming),
            new Producto(null, "GTA VI (Pre-venta)", 70000, 50, 10, "/img/GTA-VI.webp", gaming),
            new Producto(null, "Manga Dorohedoro Vol. 1", 12000, 2, 2, "/img/Dorohedoro1.webp", libreria)));

        var bcrypt = new BCryptPasswordEncoder();
        usuarios.saveAll(List.of(
            new Usuario(null, "190110222", "Paulo", "Catalán", "admin@duoc.cl", bcrypt.encode("admin123"),
                Rol.ADMINISTRADOR, "Av. Siempre Viva 123", "Región Metropolitana de Santiago", "Santiago"),
            new Usuario(null, "182345679", "Mauricio", "Ahumada", "vendedor@duoc.cl", bcrypt.encode("vende123"),
                Rol.VENDEDOR, "Calle Los Alerces 456", "Región del Biobío", "Concepción"),
            new Usuario(null, "20987654K", "Carla", "Gómez", "carla@gmail.com", bcrypt.encode("cliente123"),
                Rol.CLIENTE, "Pasaje Las Rosas 789", "Región de Valparaíso", "Viña del Mar")));
    }
}
