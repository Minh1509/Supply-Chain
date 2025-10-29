package scms_be.inventory_service.model.request;
import java.time.LocalDateTime;

import lombok.Data;

@Data
public class IssueTicketRequest {
  private Long ticketId;
  private Long companyId; 
  private Long warehouseId;
  private String issueType;
  private IssueTicketData issueTicket;

    @Data
    public static class IssueTicketData {
        private Long companyId;
        private Long warehouseId;
        private LocalDateTime issueDate;
        private String reason;
        private String issueType;
        private String referenceCode;
        private String createdBy;
        private String status;
        private String file;
        private String note;
    }
  
  private IssueReportRequest issueReport;
 
}
