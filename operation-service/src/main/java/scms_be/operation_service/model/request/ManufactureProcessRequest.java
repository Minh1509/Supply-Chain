package scms_be.operation_service.model.request;

import lombok.Data;

@Data
public class ManufactureProcessRequest {
  private Long companyId;
  private Long moId;
  private Long processId;
  private ManuProcessRequest process;
}
