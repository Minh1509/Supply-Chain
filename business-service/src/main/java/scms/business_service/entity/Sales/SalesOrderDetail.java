package scms.business_service.entity.Sales;

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
@Table(name = "sales_order_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalesOrderDetail {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long soDetailId;

  @ManyToOne
  @JoinColumn(name = "so_id")
  private SalesOrder salesOrder;

  @Column(name = "item_id")
  private Long itemId;

  @Column(name = "customer_item_id")
  private Long customerItemId;

  @Column(name = "quantity")
  private Double quantity;
  
  @Column(name = "item_price")
  private Double itemPrice;
  
  @Column(name = "discount")
  private Double discount;
  
  @Column(name = "note")
  private String note;
}
