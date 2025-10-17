package scms_be.inventory_service.model.dto;

import lombok.Data;

@Data
public class ReceiveTicketDetailDto {
  private Long RTdetailId;
  private Long ticketId;
  private Long itemId;
  private String itemCode;
  private String itemName;
  private Double quantity;
  private String note;
}
