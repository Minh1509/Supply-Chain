package scms.business_service.model.dto.request.Sales;

import java.util.List;

import lombok.Data;

@Data
public class QuotationRequest {
  private Long companyId;
  private Long requestCompanyId;
  private Long rfqId;
  
  private Double subTotal;
  private Double taxRate;
  private Double taxAmount;
  private Double totalAmount;
  private String createdBy;
  private String status;

  private List<QuotationDetailRequest> quotationDetails;

}
