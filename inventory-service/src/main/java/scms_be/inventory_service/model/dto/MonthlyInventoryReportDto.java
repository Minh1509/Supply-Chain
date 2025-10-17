package scms_be.inventory_service.model.dto;

import lombok.Data;

@Data
public class MonthlyInventoryReportDto {
  private String month;
  private Double totalQuantity;
}