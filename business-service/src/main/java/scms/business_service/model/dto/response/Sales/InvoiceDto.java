package scms.business_service.model.dto.response.Sales;


import lombok.Data;

@Data
public class InvoiceDto {
  private Long invoiceId;
  private String invoiceCode;
  private String file;
}

