package scms_be.inventory_service.event.listener;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import scms_be.inventory_service.exception.RpcException;
import scms_be.inventory_service.handler.InventoryHandler;
import scms_be.inventory_service.handler.IssueTicketHandler;
import scms_be.inventory_service.handler.ReceiveTicketHandler;
import scms_be.inventory_service.handler.TransferTicketHandler;
import scms_be.inventory_service.handler.WarehouseHandler;
import scms_be.inventory_service.model.ErrorResponse;
import scms_be.inventory_service.model.event.GenericEvent;

@Service
public class InventoryListener {


    @Autowired
    private InventoryHandler inventoryHandler;
    
    @Autowired
    private IssueTicketHandler issueTicketHandler;

    @Autowired
    private ReceiveTicketHandler receiveTicketHandler;

    @Autowired
    private TransferTicketHandler transferTicketHandler;

    @Autowired
    private WarehouseHandler warehouseHandler;

    @RabbitListener(queues = "inventory_queue")
    public Object handleEvents(GenericEvent event) {
        try {
            switch (event.getPattern()) {
                case "inventory.create":
                case "inventory.update":
                case "inventory.get_by_id":
                case "inventory.check":
                case "inventory.increase_quantity":
                case "inventory.decrease_quantity":
                case "inventory.increase_ondemand":
                case "inventory.decrease_ondemand":
                case "inventory.get_all_inventory":
                    return inventoryHandler.handle(event);
                case "issue_ticket.create":
                case "issue_ticket.get_all_in_company":
                case "issue_ticket.get_by_id":
                case "issue_ticket.update":
                case "issue_ticket.get_issue_report":
                case "issue_ticket.get_monthly_issue_report":
                case "issue_ticket.get_forecasted_issue":
                    return issueTicketHandler.handle(event);
                case "receive_ticket.create":
                case "receive_ticket.update":
                case "receive_ticket.get_by_id":
                case "receive_ticket.get_all_in_company":
                case "receive_ticket.get_receive_report":
                case "receive_ticket.get_monthly_report":
                    return receiveTicketHandler.handle(event);
                case "transfer_ticket.create":
                case "transfer_ticket.update":
                case "transfer_ticket.get_by_id":
                case "transfer_ticket.get_all_by_company":
                    return transferTicketHandler.handle(event);
                case "warehouse.create":
                case "warehouse.update":
                case "warehouse.get_by_id":
                case "warehouse.get_all_in_company":
                case "warehouse.delete":
                    return warehouseHandler.handle(event);
                default:
                    throw new RpcException(400, "Unknown event: " + event.getPattern());
            }
        } catch (RpcException ex) {
            return new ErrorResponse(ex.getStatusCode(), ex.getMessage());
        } catch (Exception ex) {
            return new ErrorResponse(500, "Internal error: " + ex.getMessage());
        }
    }
}