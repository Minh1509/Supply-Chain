package scms.business_service.model.dto.response.Sales;

import lombok.Data;

@Data
public class SalesOrderDetailDto {
  private Long id;
  private Long soId;
  private Long itemId;
  private String itemCode;
  private String itemName;
  private Long customerItemId;
  private String customerItemCode;
  private String customerItemName;
  private Double discount;
  private Double quantity;
  private Double itemPrice;
  private String note;
}
