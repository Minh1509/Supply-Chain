package scms_be.operation_service.model.dto;

import lombok.Data;

@Data
public class DeliveryOrderDetailDto {
  private Long deliveryOrderDetailId;
  private Long deliveryOrderId;
  private String deliveryOrderCode;
  private Long itemId;
  private String itemCode;
  private String itemName;
  private Double quantity;
  private String note;
}
