package cl.duoc.hijosdelasventas.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import cl.duoc.hijosdelasventas.model.Producto;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
}
