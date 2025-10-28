package scms.business_service.entity.Sales;

import java.time.LocalDateTime;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "invoices")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Invoice {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  private Long id;

  @Column(name = "sales_company_id")
  private Long salesCompanyId;

  @Column(name = "purchase_company_id")
  private Long purchaseCompanyId;

  @OneToOne
  @JoinColumn(name = "sales_order_id")
  private SalesOrder salesOrder;

  @Column(name = "code", unique = true, nullable = false)
  private String code;

  @Column(name = "payment_method")
  private String paymentMethod;
  
  @Column(name = "created_on")
  private LocalDateTime createdOn;

  @Lob
  @Column(name = "invoice_file", columnDefinition = "bytea")
  private byte[] file;
}