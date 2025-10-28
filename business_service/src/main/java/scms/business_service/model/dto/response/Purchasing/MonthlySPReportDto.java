package scms.business_service.model.dto.response.Purchasing;

import lombok.Data;

@Data
public class MonthlySPReportDto {
  private String month;
  private Double totalOrder;
  private Double totalQuantity;
  private Double totalAmount;
}