package scms_be.inventory_service.handler;

import com.fasterxml.jackson.databind.ObjectMapper;

import scms_be.inventory_service.exception.RpcException;
import scms_be.inventory_service.model.event.GenericEvent;
import scms_be.inventory_service.model.request.ReceiveTicketRequest;
import scms_be.inventory_service.service.ReceiveTicketService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ReceiveTicketHandler {

    @Autowired
    private ReceiveTicketService receiveTicketService;
    @Autowired
    private ObjectMapper objectMapper;

    public Object handle(GenericEvent event) {
        ReceiveTicketRequest request = objectMapper.convertValue(event.getData(), ReceiveTicketRequest.class);
        System.out.println("event: " + event);
        switch (event.getPattern()) {
            case "receive_ticket.create":
                return receiveTicketService.create(request.getReceiveTicket());
            case "receive_ticket.update":
                return receiveTicketService.update(request.getTicketId(), request.getReceiveTicket());
            case "receive_ticket.get_by_id":
                return receiveTicketService.getById(request.getTicketId());
            case "receive_ticket.get_all_in_company":
                return receiveTicketService.getAllInCompany(request.getCompanyId());
            case "receive_ticket.get_receive_report":
                return receiveTicketService.getReceiveReport(request.getReceiveReport(), request.getCompanyId());
            case "receive_ticket.get_monthly_receive_report":
                return receiveTicketService.getMonthlyReceiveReport(request.getCompanyId(), 
                    request.getReceiveType(), request.getWarehouseId());
            default:
                throw new RpcException(400, "Unknown receive ticket event: " + event.getPattern());
        }
    }
}