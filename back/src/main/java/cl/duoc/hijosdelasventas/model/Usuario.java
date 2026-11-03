package cl.duoc.hijosdelasventas.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Usuario {
    public enum Rol { ADMINISTRADOR, VENDEDOR, CLIENTE }

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String run;
    private String nombre;
    private String apellidos;

    @Column(nullable = false, unique = true)
    private String correo;

    @Column(nullable = false)
    private String password; // guardada cifrada con BCrypt

    @Enumerated(EnumType.STRING)
    private Rol rol;

    private String direccion;
    private String region;
    private String comuna;
}
