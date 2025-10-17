package scms_be.inventory_service.model.dto.publisher;

import java.util.List;

import lombok.Data;

@Data
public class BOMDto {
  private Long bomId;
  private String bomCode;
  private Long itemId;
  private String itemCode;
  private String itemName;
  private String description;
  private String status;
  
  private List<BOMDetailDto> bomDetails;
}
