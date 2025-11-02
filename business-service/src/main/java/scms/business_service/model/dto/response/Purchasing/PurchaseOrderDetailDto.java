package scms.business_service.model.dto.response.Purchasing;

import lombok.Data;

@Data
public class PurchaseOrderDetailDto {
  private Long purchaseOrderDetailId;
  private Long poId;
  private String poCode;
  private Long itemId;
  private String itemCode;
  private String itemName;
  private Long supplierItemId;
  private String supplierItemCode;
  private String supplierItemName;
  private Double discount;
  private Double quantity;
  private Double itemPrice;
  private String note;
}

