package scms_be.general_service.model.request;

import java.util.List;

import lombok.Data;

@Data
public class ProductRequest {
    private Long productId;
    private List<Long> productIds;
    private Long itemId;
    private Long companyId;
    private String qrCode;
    private String batchNo;
    private Integer quantity;
    private Long moId;
    private String moCode;
    private String manufacturerCompanyName;
    private String newStatus;
}