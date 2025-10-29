package scms.business_service.model.dto.response.Sales;

import lombok.Data;

@Data
public class ItemReportDto {
  private Long itemId;
  private Double totalQuantity = 0.0;
  private Double totalRevenue = 0.0;
}
