package scms_be.inventory_service.model.request.publisher;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class ManuReportRequest {
  private LocalDateTime startTime;
  private LocalDateTime endTime;
  private String type;
}
