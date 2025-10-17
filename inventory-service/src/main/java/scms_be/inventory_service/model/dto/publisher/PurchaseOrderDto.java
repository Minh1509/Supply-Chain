package scms_be.inventory_service.model.dto.publisher;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;

@Data
public class PurchaseOrderDto {
  private Long poId;
  private String poCode;
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
