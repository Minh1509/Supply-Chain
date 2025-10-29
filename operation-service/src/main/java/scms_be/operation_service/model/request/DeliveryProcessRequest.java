package scms_be.operation_service.model.request;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class DeliveryProcessRequest {
  private Long doId;
  private DeliveryProcessData deliveryProcessData;
  @Data
  public static class DeliveryProcessData {
    private Long doId;
    private String location;
    private LocalDateTime arrivalTime;
    private String note;
  }
}
