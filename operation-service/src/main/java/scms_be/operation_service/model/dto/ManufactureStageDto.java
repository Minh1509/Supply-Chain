package scms_be.operation_service.model.dto;

import java.util.List;

import lombok.Data;

@Data
public class ManufactureStageDto {
  private Long stageId;
  private String stageCode;
  private Long itemId;
  private String itemName;
  private String itemCode;
  private String description;
  private String status;

  private List<ManufactureStageDetailDto> stageDetails;
}