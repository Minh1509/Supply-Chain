package scms_be.general_service.model.request;

import lombok.Data;

@Data
public class ProductRequest {
    private Long productId;
    private Long itemId;
    private Long companyId;
    private String qrCode;
    private String batchNo;
    private Integer quantity;
    private Long moId;
    private String newStatus;
}