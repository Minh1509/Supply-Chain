package scms_be.general_service.model.request;

import lombok.Data;

@Data
public class ProductRequest {
    private Long itemId;
    private Long productId; // for get by id, update, delete
    private ProductData product;
    private String qrCode;
    private Long companyId;
    private Long batchNo;
    private Long newCompanyId;
    
    @Data
    public static class ProductData {
        private Long batchNo;
        private String qrCode;
    }
}