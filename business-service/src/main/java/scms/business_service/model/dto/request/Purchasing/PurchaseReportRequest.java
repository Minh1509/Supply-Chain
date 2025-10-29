package scms.business_service.model.dto.request.Purchasing;

import java.time.LocalDate;

import lombok.Data;

@Data
public class PurchaseReportRequest {
  private LocalDate startDate;
  private LocalDate endDate;
}
