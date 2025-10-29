package scms_be.operation_service.model.request;

import lombok.Data;

@Data
public class DeliveryOrderRequest {
  private Long companyId;
  private Long soId;
  private Long doId;
  private DeliveryOrderData deliveryOrderData;

  @Data
  public class DeliveryOrderData {
    private Long soId;
    private String status;
    private String createdBy;
  }

}