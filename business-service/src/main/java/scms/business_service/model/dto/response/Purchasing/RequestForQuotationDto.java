package scms.business_service.model.dto.response.Purchasing;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;

@Data
public class RequestForQuotationDto {
  private Long id;
  private String code;
  private Long companyId;
  private String companyCode;
  private String companyName;
  private Long requestedCompanyId;
  private String requestedCompanyCode;
  private String requestedCompanyName;
  private LocalDateTime needByDate;
  private String createdBy;
  private LocalDateTime createdOn;
  private LocalDateTime lastUpdatedOn;
  private String status;

  private List<RfqDetailDto> rfqDetails;
}
