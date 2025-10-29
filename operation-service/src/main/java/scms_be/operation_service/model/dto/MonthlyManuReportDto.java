package scms_be.operation_service.model.dto;

import lombok.Data;

@Data
public class MonthlyManuReportDto {
  private String month;
  private Double totalQuantity;
}
