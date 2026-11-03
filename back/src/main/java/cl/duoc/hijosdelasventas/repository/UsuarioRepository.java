package cl.duoc.hijosdelasventas.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import cl.duoc.hijosdelasventas.model.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
}
