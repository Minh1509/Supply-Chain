package scms.business_service.entity.Purchasing;

import java.time.LocalDateTime;
import java.util.List;

import scms.business_service.entity.Sales.Quotation;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "purchase_orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrder {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  private Long id;

  @Column(name = "company_id", nullable = false)
  private Long companyId;

  @Column(name = "code", nullable = false, unique = true)
  private String code;

  @Column(name = "supplier_company_id", nullable = false)
  private Long supplierCompanyId;

  @ManyToOne
  @JoinColumn(name = "quotation_id", nullable = false)
  private Quotation quotation;

  @Column(name = "receive_warehouse_id", nullable = false)
  private Long receiveWarehouseId;

  @Column(name = "payment_method")
  private String paymentMethod;
  
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

  @OneToMany(mappedBy = "purchaseOrder", orphanRemoval = true, cascade = CascadeType.ALL)
  private List<PurchaseOrderDetail> details;
}
