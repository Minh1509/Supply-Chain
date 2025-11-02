package scms.business_service.model.dto.response.Sales;

import lombok.Data;

@Data
public class QuotationDetailDto {
  private Long quotationDetailId;
  private Long quotationId;
  private Long itemId;
  private String itemCode;
  private String itemName;
  private Long customerItemId;
  private String customerItemCode;
  private String customerItemName;
  private Double quantity;
  private Double itemPrice;
  private Double discount;
  private String note;
}
