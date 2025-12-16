package scms.business_service.model.dto.response.Sales;

import lombok.Data;

@Data
public class ItemReportDto {
  private Long itemId;
  private String itemCode;
  private String itemName;
  private String itemUrl;
  private Double totalQuantity;
}
