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
@Table(name = "purchase_order_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderDetail {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long purchaseOrderDetailId;

  @ManyToOne
  @JoinColumn(name = "purchase_order_id", nullable = false)
  private PurchaseOrder po;

  @Column(name = "item_id", nullable = false)
  private Long itemId;

  @Column(name = "supplier_item_id", nullable = false)
  private Long supplierItemId;

  @Column(name = "quantity")
  private Double quantity;
  
  @Column(name = "item_price")
  private Double itemPrice;
  
  @Column(name = "discount")
  private Double discount;
  
  @Column(name = "note")
  private String note;

}
