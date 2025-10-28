package scms.business_service.model.dto.response.Sales;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class InvoiceDto {
  private Long id;
  private String code;
  private byte[] file;
}
