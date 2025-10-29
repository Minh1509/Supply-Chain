package scms_be.operation_service.model.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class DeliveryProcessDto {
  private Long deliveryProcessId;
  private Long doId;
  private String doCode;
  private String location;
  private LocalDateTime arrivalTime;
  private String note;
}
