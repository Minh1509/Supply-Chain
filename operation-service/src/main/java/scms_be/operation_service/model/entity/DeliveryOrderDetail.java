package scms_be.operation_service.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "delivery_order_detail")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryOrderDetail {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long deliveryOrderDetailId;

  @ManyToOne
  @JoinColumn(name = "delivery_order_id", nullable = false)
  private DeliveryOrder deliveryOrder;

  @Column(name = "item_id", nullable = false)
  private Long itemId;

  private Double quantity;
  private String note;

}
