package scms.business_service.entity.Sales;

import java.time.LocalDateTime;
import java.util.List;

import scms.business_service.entity.Purchasing.PurchaseOrder;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "sales_orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalesOrder {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  private Long id;

  @Column(name = "company_id")
  private Long companyId;

  @Column(name = "customer_company_id")
  private Long customerCompanyId;

  @OneToOne
  @JoinColumn(name = "purchase_order_id")
  private PurchaseOrder purchaseOrder;

  @Column(name = "code", unique = true, nullable = false)
  private String code;

  @Column(name = "payment_method")
  private String paymentMethod;
  
  @Column(name = "delivery_from_address")
  private String deliveryFromAddress;
  
  @Column(name = "delivery_to_address")
  private String deliveryToAddress;
  
  @Column(name = "created_by")
  private String createdBy;
  
  @Column(name = "created_on")
  private LocalDateTime createdOn;
  
  @Column(name = "last_updated_on")
  private LocalDateTime lastUpdatedOn;
  
  @Column(name = "status")
  private String status;

  @OneToMany(mappedBy = "salesOrder", orphanRemoval = true, cascade = CascadeType.ALL)
  private List<SalesOrderDetail> details;
}