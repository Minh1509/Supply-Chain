package scms_be.inventory_service.model.dto;

import lombok.Data;

@Data
public class InventoryDto {
  private Long inventoryId;
  private Long warehouseId;
  private String warehouseCode;
  private String warehouseName;
  private Long itemId;
  private String itemCode;
  private String itemName;
  private Double quantity;
  private Double onDemandQuantity;

}
