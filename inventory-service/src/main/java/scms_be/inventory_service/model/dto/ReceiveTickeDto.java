package scms_be.inventory_service.model.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;

@Data
public class ReceiveTickeDto {
  private Long ticketId;
  private Long companyId;
  private String ticketCode;
  private Long warehouseId;
  private String warehouseCode;
  private String warehouseName;
  private LocalDateTime receiveDate;
  private String reason;
  private String receiveType; // mo/po/tt
  private Long referenceId;
  private String referenceCode;
  private String createdBy;
  private LocalDateTime createdOn;
  private LocalDateTime lastUpdatedOn;
  private String status;
  private String file;

  private List<ReceiveTicketDetailDto> receiveTicketDetails;
}
