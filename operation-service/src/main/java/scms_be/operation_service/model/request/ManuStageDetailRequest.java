package scms_be.operation_service.model.request;

import lombok.Data;

@Data
public class ManuStageDetailRequest {
  private String stageName;
  private Integer stageOrder;
  private Long estimatedTime;
  private String description;
}
