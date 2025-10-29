package scms_be.operation_service.model.dto.publisher;

import lombok.Data;

@Data
public class ManufactureLineDto {
  private Long lineId;
  private Long companyId;
  private Long plantId;
  private String plantName;
  private String lineCode;
  private String lineName;
  private double capacity;
  private String description;
}
