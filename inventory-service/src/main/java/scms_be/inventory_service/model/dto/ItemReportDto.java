package scms_be.inventory_service.model.dto;

import lombok.Data;

@Data
public class ItemReportDto {
    private Long itemId;
    private String itemCode;
    private String itemName;
    private Double totalQuantity;
}