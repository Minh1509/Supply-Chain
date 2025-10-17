package scms_be.inventory_service.model.request;
import lombok.Data;

@Data
public class TransferTicketDetailRequest {
  private Long itemId;
  private Double quantity;
  private String note;
}
