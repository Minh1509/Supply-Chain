package scms.business_service.model.dto.request.Purchasing;

import lombok.Data;

@Data
public class PurchaseOrderDetailRequest {
  private Long itemId;
  private Long supplierItemId;
  private Double discount;
  private Double quantity;
  private Double itemPrice;
  private String note;
}
