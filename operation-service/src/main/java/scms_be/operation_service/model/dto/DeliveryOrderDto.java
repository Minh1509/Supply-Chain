package scms_be.operation_service.model.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;

@Data
public class DeliveryOrderDto {
  private Long doId;
  private String doCode;
  private Long soId;
  private String soCode;
  private String createdBy;
  private LocalDateTime createdOn;
  private LocalDateTime lastUpdatedOn;
  private String deliveryFromAddress;
  private String deliveryToAddress;
  private String status;

  private List<DeliveryOrderDetailDto> deliveryOrderDetails;
}
