package scms.business_service.entity.Purchasing;

import java.time.LocalDateTime;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "request_for_quotations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RequestForQuotation {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long rfqId;

  @Column(name = "company_id", nullable = false)
  private Long companyId;

  @Column(nullable = false, unique = true)
  private String rfqCode;

  @Column(name = "requested_company_id", nullable = false)
  private Long requestedCompanyId;

  @Column(name = "need_by_date")
  private LocalDateTime needByDate;
  
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

  @OneToMany(mappedBy = "rfq", orphanRemoval = true, cascade = CascadeType.ALL)
  private List<RfqDetail> rfqDetails;
}
