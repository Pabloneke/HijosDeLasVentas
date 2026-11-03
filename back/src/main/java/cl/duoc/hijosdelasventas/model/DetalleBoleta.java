package cl.duoc.hijosdelasventas.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter @Setter @NoArgsConstructor
public class DetalleBoleta {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private Boleta boleta;

    @ManyToOne(optional = false)
    private Producto producto;

    private Integer cantidad;
    private Integer precio; // precio unitario al momento de la compra
}
