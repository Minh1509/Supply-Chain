package scms.business_service.model.dto.request.Sales;

import lombok.Data;

@Data
public class SalesOrderDetailRequest {
  private Long itemId;
  private Long customerItemId;
  private Double discount;
  private Double quantity;
  private Double itemPrice;
  private String note;
}
