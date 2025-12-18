package scms.business_service.entity.Sales;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.*;

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
  private Long invoiceId;

  @Column(name = "sales_company_id")
  private Long salesCompanyId;

  @Column(name = "purchase_company_id")
  private Long purchaseCompanyId;

  @OneToOne
  @JoinColumn(name = "so_id")
  private SalesOrder salesOrder;

  @Column(unique = true, nullable = false)
  private String invoiceCode;

  @Column(name = "payment_method")
  private String paymentMethod;
  
  @CreationTimestamp
  @Column(name = "created_on")
  private LocalDateTime createdOn;

  @Lob
  @Basic(fetch = FetchType.EAGER)
  @Column(name = "invoice_file")
  private byte[] file;
}