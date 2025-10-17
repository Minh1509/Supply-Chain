package scms_be.inventory_service.model.dto.publisher;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;

@Data
public class SalesOrderDto {
  private Long soId;
  private String soCode;
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
