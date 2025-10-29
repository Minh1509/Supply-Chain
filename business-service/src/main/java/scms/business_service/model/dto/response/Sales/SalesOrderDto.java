package scms.business_service.model.dto.response.Sales;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;

@Data
public class SalesOrderDto {
  private Long id;
  private String code;
  private Long companyId;
  private String companyCode;
  private String companyName;
  private Long customerCompanyId;
  private String customerCompanyCode;
  private String customerCompanyName;
  private Long poId;
  private String poCode;
  private String paymentMethod;
  private String deliveryFromAddress;
  private String deliveryToAddress;
  private Double subTotal;
  private Double taxRate;
  private Double taxAmount;
  private Double totalAmount;
  private String createdBy;
  private LocalDateTime createdOn;
  private LocalDateTime lastUpdatedOn;
  private String status;

  private List<SalesOrderDetailDto> salesOrderDetails;
}
