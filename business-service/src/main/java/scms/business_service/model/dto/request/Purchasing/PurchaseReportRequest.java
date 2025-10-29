package scms.business_service.model.dto.request.Purchasing;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class PurchaseReportRequest {
  private LocalDateTime startDate;
  private LocalDateTime endDate;
}
