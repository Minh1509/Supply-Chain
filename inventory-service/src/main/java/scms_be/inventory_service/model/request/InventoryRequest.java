package scms_be.inventory_service.model.request;

import lombok.Data;

@Data
public class InventoryRequest {
    private Long inventoryId;
    private Long companyId; 
    private Long warehouseId;
    private Long itemId;
    private Double amount;
    private InventoryData inventory;

    @Data
    public static class InventoryData {
        private Long warehouseId;
        private Long itemId;
        private Double quantity;
        private Double onDemandQuantity;
    }
}
