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
@Table(name = "quotation_details")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuotationDetail {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  private Long id;

  @ManyToOne
  @JoinColumn(name = "quotation_id")
  private Quotation quotation;

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