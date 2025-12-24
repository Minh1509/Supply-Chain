package scms_be.inventory_service.model.request.publisher;

import java.util.List;
import lombok.Data;

@Data
public class ItemRequest {
    private Long companyId;
    private Long itemId; // for get by id, update, delete
    private List<Long> itemIds; // for batch get by ids
    private ItemData item;
    
    @Data
    public static class ItemData {
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
}