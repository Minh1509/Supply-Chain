package scms_be.inventory_service.model.dto.publisher;

import lombok.Data;

@Data
public class BOMDetailDto {
  private Long id;
  private Long bomId;
  private Long itemId;
  private String itemCode;
  private String itemName;
  private Double quantity;
  private String note;
}
