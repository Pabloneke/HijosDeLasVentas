package cl.duoc.hijosdelasventas.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import cl.duoc.hijosdelasventas.model.Boleta;

public interface BoletaRepository extends JpaRepository<Boleta, Long> {
}
