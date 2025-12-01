package scms_be.general_service.model.dto;

import lombok.Data;

@Data
public class ProductDetailDto {
  private Long productId;
  private Long itemId;
  private String itemCode;
  private String itemName;
  private String technicalSpecifications;
  private String description;
  private String imageUrl;
  private Long currentCompanyId;
  private String serialNumber;
  private String batchNo;
  private String qrCode;
  private String status;
}
