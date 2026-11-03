package cl.duoc.hijosdelasventas.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter @Setter @NoArgsConstructor
public class Boleta {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime fecha = LocalDateTime.now();
    private Integer total;

    // Relación opcional (línea discontinua del modelo): null cuando compra un invitado
    @ManyToOne
    private Usuario usuario;

    // Al guardar la boleta se guardan también sus detalles
    @OneToMany(mappedBy = "boleta", cascade = CascadeType.ALL)
    private List<DetalleBoleta> detalles = new ArrayList<>();
}
