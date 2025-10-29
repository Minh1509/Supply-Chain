package scms.business_service.entity.Sales;

import java.time.LocalDateTime;
import java.util.List;

import scms.business_service.entity.Purchasing.RequestForQuotation;

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
@Table(name = "quotations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Quotation {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  private Long id;

  @Column(name = "company_id")
  private Long companyId;

  @Column(name = "request_company_id")
  private Long requestCompanyId;

  @OneToOne
  @JoinColumn(name = "rfq_id")
  private RequestForQuotation rfq;

  @Column(name = "code", unique = true, nullable = false)
  private String code;

  @Column(name = "sub_total")
  private Double subTotal;
  
  @Column(name = "tax_rate")
  private Double taxRate;
  
  @Column(name = "tax_amount")
  private Double taxAmount;
  
  @Column(name = "total_amount")
  private Double totalAmount;
  
  @Column(name = "created_by")
  private String createdBy;
  
  @Column(name = "created_on")
  private LocalDateTime createdOn;
  
  @Column(name = "last_updated_on")
  private LocalDateTime lastUpdatedOn;
  
  @Column(name = "status")
  private String status;

  @OneToMany(mappedBy = "quotation", orphanRemoval = true, cascade = CascadeType.ALL)
  private List<QuotationDetail> details;
}