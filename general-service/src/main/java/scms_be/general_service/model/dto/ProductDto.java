package scms_be.general_service.model.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class ProductDto {
  private Long productId;
  private Long itemId;
  private String itemCode;
  private String itemName;
  private String technicalSpecifications;
  private Long currentCompanyId;
  private String currentCompanyName;
  private String serialNumber;
  private String batchNo;
  private String qrCode;
  private String status;
  private LocalDateTime manufacturedDate;
  private Long manufacturerCompanyId;
  private String manufacturerCompanyName;
}
