package scms_be.inventory_service.model.request.publisher;

import lombok.Data;

@Data
public class BOMDetailRequest {
  private Long itemId;
  private Double quantity;
  private String note;
}
