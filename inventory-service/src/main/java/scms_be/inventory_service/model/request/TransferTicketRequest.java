package scms_be.inventory_service.model.request;

import java.util.List;

import lombok.Data;

@Data
public class TransferTicketRequest {
    private Long ticketId;
    private Long companyId; 
    private TransferTicketData transferTicket;

    @Data
    public static class TransferTicketData {
      private Long companyId;
      private Long fromWarehouseId;
      private Long toWarehouseId;
      private String reason;
      private String createdBy;
      private String status;
      private String file;

      private List<TransferTicketDetailRequest> transferTicketDetails;
    }
  

}
