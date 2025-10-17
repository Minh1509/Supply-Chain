package scms_be.inventory_service.model.request;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class IssueReportRequest {
  private LocalDateTime startTime;
  private LocalDateTime endTime;
  private String issueType;
  private Long warehouseId;
}
