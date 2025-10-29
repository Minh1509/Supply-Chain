package scms_be.operation_service.model.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "delivery_process")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class DeliveryProcess {
  @Id
  @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
  private Long deliveryProcessId;

  @ManyToOne
  @JoinColumn(name = "do_id", nullable = false)
  private DeliveryOrder deliveryOrder;

  private String location;
  private LocalDateTime arrivalTime;
  private String note;
}
