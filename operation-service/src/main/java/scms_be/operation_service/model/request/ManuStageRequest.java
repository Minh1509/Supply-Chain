package scms_be.operation_service.model.request;

import java.util.List;

import lombok.Data;

@Data
public class ManuStageRequest {
  private Long stageId;
  private Long companyId;
  private Long itemId;
  private ManuStageData manuStageData;

  @Data
  public static class ManuStageData {
    private Long itemId;
    private String description;
    private String status;
    private List<ManuStageDetailRequest> stageDetails;
  }
}
