package cl.duoc.hijosdelasventas.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Producto {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    private Integer precio;
    private Integer stock;
    private Integer stockCritico; // si stock <= stockCritico se muestra la alerta (RF5)
    private String imagen;

    @ManyToOne(optional = false)
    private Categoria categoria;
}
