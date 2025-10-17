package scms_be.inventory_service.model.request;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class ReceiveReportRequest {
  private LocalDateTime startTime;
  private LocalDateTime endTime;
  private String receiveType;
  private Long warehouseId;
}
