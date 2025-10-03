package scms_be.general_service.model.dto;
import lombok.Data;

@Data
public class ItemDto {
  private Long itemId;
  private Long companyId;
  private String itemCode;
  private String itemName;
  private String itemType;
  private Boolean isSellable;
  private String uom;
  private String technicalSpecifications;
  private Double importPrice;
  private Double exportPrice;
  private String description;
}