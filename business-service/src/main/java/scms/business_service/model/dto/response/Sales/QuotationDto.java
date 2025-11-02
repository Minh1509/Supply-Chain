package scms.business_service.model.dto.response.Sales;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;

@Data
public class QuotationDto {
  private Long quotationId;
  private String quotationCode;
  private Long companyId;
  private String companyCode;
  private String companyName;
  private Long requestCompanyId;
  private String requestCompanyCode;
  private String requestCompanyName;
  private Long rfqId;
  private String rfqCode;
  private Double subTotal;
  private Double taxRate;
  private Double taxAmount;
  private Double totalAmount;
  private String createdBy;
  private LocalDateTime createdOn;
  private LocalDateTime lastUpdatedOn;
  private String status;

  private List<QuotationDetailDto> quotationDetails;
}
