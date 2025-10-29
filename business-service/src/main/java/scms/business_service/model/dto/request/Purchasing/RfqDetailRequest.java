package scms.business_service.model.dto.request.Purchasing;

import lombok.Data;

@Data
public class RfqDetailRequest {
  private Long itemId;
  private Long supplierItemId;
  private Double quantity;
  private String note;
}
