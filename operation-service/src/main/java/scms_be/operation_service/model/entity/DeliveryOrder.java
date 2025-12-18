package scms_be.operation_service.model.entity;

import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Table(name = "delivery_order")
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryOrder {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long doId;

  @Column(unique = true, nullable = false)
  private String doCode;

  @Column(name = "so_id", nullable = false)
  private Long soId;

  private String createdBy;

  @Column(nullable = false)
  @CreationTimestamp
  private LocalDateTime createdOn;
  
  @UpdateTimestamp
  private LocalDateTime lastUpdatedOn;
  
  private String status;

  @OneToMany(mappedBy = "deliveryOrder", orphanRemoval = true, cascade = CascadeType.ALL)
  private List<DeliveryOrderDetail> deliveryOrderDetails;

}
