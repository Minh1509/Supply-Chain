package scms_be.inventory_service.model.dto;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;

@Data
public class TransferTicketDto {
  private Long ticketId;
  private Long companyId;
  private String ticketCode;
  private Long fromWarehouseId;
  private String fromWarehouseCode;
  private String fromWarehouseName;
  private Long toWarehouseId;
  private String toWarehouseCode;
  private String toWarehouseName;
  private String reason;
  private String createdBy;
  private LocalDateTime createdOn;
  private LocalDateTime lastUpdatedOn;
  private String status;
  private String file;

  private List<TransferTicketDetailDto> transferTicketDetails;
}
