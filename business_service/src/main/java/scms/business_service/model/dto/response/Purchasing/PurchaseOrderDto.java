package scms.business_service.model.dto.response.Purchasing;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;

@Data
public class PurchaseOrderDto {
  private Long id;
  private String code;
  private Long companyId;
  private String companyCode;
  private String companyName;
  private Long supplierCompanyId;
  private String supplierCompanyCode;
  private String supplierCompanyName;
  private Long quotationId;
  private String quotationCode;
  private Long receiveWarehouseId;
  private String receiveWarehouseCode;
  private String paymentMethod;
  private String deliveryToAddress;
  private Double subTotal;
  private Double taxRate;
  private Double taxAmount;
  private Double totalAmount;
  private LocalDateTime createdOn;
  private LocalDateTime lastUpdatedOn;
  private String createdBy;
  private String status;

  private List<PurchaseOrderDetailDto> purchaseOrderDetails;
}
