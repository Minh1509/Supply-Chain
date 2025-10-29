package scms_be.operation_service.model.request;

import lombok.Data;

import java.util.List;

@Data
public class BOMRequest {
  private Long companyId;
  private Long itemId;
  private Long bomId;
  private BOMData bom;
  @Data
  public static class BOMData {
    private Long itemId;
    private String description;
    private String status;

    private List<BOMDetailRequest> bomDetails;
    }
}
