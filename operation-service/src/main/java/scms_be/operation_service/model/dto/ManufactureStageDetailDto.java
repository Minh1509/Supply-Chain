package scms_be.operation_service.model.dto;

import lombok.Data;

@Data
public class ManufactureStageDetailDto {
  private Long stageDetailId;
  private Long stageId;
  private String stageName;
  private Integer stageOrder;
  private Long estimatedTime;
  private String description;
}
