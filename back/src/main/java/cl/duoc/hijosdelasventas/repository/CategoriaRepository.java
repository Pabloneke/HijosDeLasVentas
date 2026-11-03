package cl.duoc.hijosdelasventas.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import cl.duoc.hijosdelasventas.model.Categoria;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
}
