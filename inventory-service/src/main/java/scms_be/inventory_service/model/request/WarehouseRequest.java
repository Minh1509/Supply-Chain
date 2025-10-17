package scms_be.inventory_service.model.request;
import lombok.Data;

@Data
public class WarehouseRequest {
  // For handler operations
  private Long warehouseId;
  private Long companyId;
  private WarehouseData warehouse;

    @Data
    public static class WarehouseData {
      private String warehouseName;
      private String description;
      private double maxCapacity;
      private String warehouseType;
      private String status;
    }
}
