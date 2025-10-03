package scms_be.general_service.model.dto;

import lombok.Data;

@Data
public class ManufacturePlantDto {
  private Long plantId;
  private Long companyId;
  private String plantCode;
  private String plantName;
  private String description;
}
