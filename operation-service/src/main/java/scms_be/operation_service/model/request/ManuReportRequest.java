package scms_be.operation_service.model.request;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class ManuReportRequest {
  private LocalDateTime startTime;
  private LocalDateTime endTime;
  private String type;
}
