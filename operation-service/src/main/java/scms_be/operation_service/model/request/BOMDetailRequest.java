package scms_be.operation_service.model.request;

import lombok.Data;

@Data
public class BOMDetailRequest {
  private Long itemId;
  private Double quantity;
  private String note;
}
