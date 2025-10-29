package scms.business_service.model.dto.request.Sales;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class SalesReportRequest {
  private LocalDateTime startDate;
  private LocalDateTime endDate;
}
