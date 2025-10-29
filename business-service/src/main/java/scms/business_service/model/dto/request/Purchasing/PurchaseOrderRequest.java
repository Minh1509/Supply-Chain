package scms.business_service.model.dto.request.Purchasing;

import lombok.Data;

@Data
public class PurchaseOrderRequest {
  private Long companyId;
  private Long supplierCompanyId;
  private Long quotationId;
  private Long receiveWarehouseId;
  private String paymentMethod;
  private String deliveryToAddress;
  private String createdBy;
  private String status;
}
