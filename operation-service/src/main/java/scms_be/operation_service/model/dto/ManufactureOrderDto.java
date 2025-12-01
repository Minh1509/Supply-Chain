package scms_be.operation_service.model.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class ManufactureOrderDto {
  private Long moId;
  private String moCode;
  private Long itemId;
  private String itemCode;
  private String itemName;
  private Long lineId;
  private String lineCode;
  private String lineName;
  private String type;
  private Double quantity;
  private LocalDateTime estimatedStartTime;
  private LocalDateTime estimatedEndTime;
  private String createdBy;
  private LocalDateTime createdOn;
  private LocalDateTime lastUpdatedOn;
  private String status;
  private String batchNo;
  private Double completedQuantity;
  private Boolean productsGenerated;
}
