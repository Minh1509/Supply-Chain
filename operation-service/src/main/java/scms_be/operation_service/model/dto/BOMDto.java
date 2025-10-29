package scms_be.operation_service.model.dto;

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
