package scms_be.operation_service.model.request;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class ManuOrderRequest {
  private Long companyId;
  private Long itemId;
  private Long moId;
  private String moCode;
  private String type;
  private Double completedQuantity;
  private ManuOrderData manuOrderData;

  @Data
  public class ManuOrderData{
    private Long itemId;
    private Long lineId;
    private String type;
    private Double quantity;
    private LocalDateTime estimatedStartTime;
    private LocalDateTime estimatedEndTime;
    private String createdBy;
    private String status;
  }
  private ManuReportRequest manuReportRequest;
}
