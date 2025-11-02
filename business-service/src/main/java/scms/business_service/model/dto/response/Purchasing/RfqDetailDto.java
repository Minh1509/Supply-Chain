package scms.business_service.model.dto.response.Purchasing;

import lombok.Data;

@Data
public class RfqDetailDto {
  private Long RfqDetailId;
  private Long rfqId;
  private String rfqCode;
  private Long itemId;
  private String itemCode;
  private String itemName;
  private Long supplierItemId;
  private String supplierItemCode;
  private String supplierItemName;
  private Double supplierItemPrice;
  private Double quantity;
  private String note;
}
