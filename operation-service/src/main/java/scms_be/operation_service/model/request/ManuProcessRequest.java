package scms_be.operation_service.model.request;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class ManuProcessRequest {
  private Long companyId;
  private Long moId;
  private Long processId;
  private ManuProcessData process;

  @Data
  public static class ManuProcessData {
    private Long moId;
    private Long stageDetailId;
    private LocalDateTime startedOn;
    private LocalDateTime finishedOn;
    private String status;
  }
}
