package scms.business_service.model.dto.request.Sales;


import lombok.Data;

@Data
public class SalesOrderRequest {
  private Long companyId;
  private Long customerCompanyId;
  private Long poId;
  private String paymentMethod;
  private String deliveryFromAddress;
  private String deliveryToAddress;
  private String createdBy;
  private String status;
}
