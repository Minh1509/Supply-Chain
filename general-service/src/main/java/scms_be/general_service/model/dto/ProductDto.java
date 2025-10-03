package scms_be.general_service.model.dto;

import lombok.Data;

@Data
public class ProductDto {
  private Long productId;
  private Long itemId;
  private String itemName;
  private String technicalSpecifications;
  private Long currentCompanyId;
  private String serialNumber;
  private Long batchNo;
  private String qrCode;
}
