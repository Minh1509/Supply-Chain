package scms.business_service.entity.Purchasing;

import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

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
  private Long poId;

  @Column(name = "company_id", nullable = false)
  private Long companyId;

  @Column(nullable = false, unique = true)
  private String poCode;

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
  
  @CreationTimestamp
  @Column(name = "created_on")
  private LocalDateTime createdOn;
  
  @UpdateTimestamp
  @Column(name = "last_updated_on")
  private LocalDateTime lastUpdatedOn;
  
  @Column(name = "status")
  private String status;

  @OneToMany(mappedBy = "po", orphanRemoval = true, cascade = CascadeType.ALL)
  private List<PurchaseOrderDetail> purchaseOrderDetails;
}
