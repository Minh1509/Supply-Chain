package scms_be.general_service.model.dto;

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
