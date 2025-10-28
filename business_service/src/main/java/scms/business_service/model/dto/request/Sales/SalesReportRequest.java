package scms.business_service.model.dto.request.Sales;

import java.time.LocalDate;

import lombok.Data;

@Data
public class SalesReportRequest {
  private Long companyId;
  private String status;
  private LocalDate startDate;
  private LocalDate endDate;
}
