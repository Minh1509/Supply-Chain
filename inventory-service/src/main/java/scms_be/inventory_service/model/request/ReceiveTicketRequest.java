package scms_be.inventory_service.model.request;
import java.time.LocalDateTime;

import lombok.Data;

@Data
public class ReceiveTicketRequest {
  private Long ticketId;
  private Long companyId; 
  private Long warehouseId;
  private String receiveType;
  private ReceiveTicketData receiveTicket ;

    @Data
    public static class ReceiveTicketData {
      private Long companyId;
      private Long warehouseId;
      private LocalDateTime receiveDate;
      private String reason;
      private String receiveType; // mo/po/tt
      private String referenceCode;
      private String createdBy;
      private String status;
      private String file;
      private String note;
    }
}
