package scms.business_service.entity.Purchasing;

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
@Table(name = "rfq_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RfqDetail {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  private Long id;

  @ManyToOne
  @JoinColumn(name = "rfq_id", nullable = false)
  private RequestForQuotation rfq;

  @Column(name = "item_id", nullable = false)
  private Long itemId;

  @Column(name = "supplier_item_id", nullable = false)
  private Long supplierItemId;

  @Column(name = "quantity")
  private Double quantity;
  
  @Column(name = "note")
  private String note;
}
