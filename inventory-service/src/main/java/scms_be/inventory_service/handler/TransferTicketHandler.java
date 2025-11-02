package scms_be.inventory_service.handler;

import com.fasterxml.jackson.databind.ObjectMapper;

import scms_be.inventory_service.exception.RpcException;
import scms_be.inventory_service.model.event.GenericEvent;
import scms_be.inventory_service.model.request.TransferTicketRequest;
import scms_be.inventory_service.service.TransferTicketService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TransferTicketHandler {

    @Autowired
    private TransferTicketService transferTicketService;
    @Autowired
    private ObjectMapper objectMapper;

    public Object handle(GenericEvent event) {
        TransferTicketRequest request = objectMapper.convertValue(event.getData(), TransferTicketRequest.class);
        System.out.println("event: " + event);
        switch (event.getPattern()) {
            case "transfer_ticket.create":
                return transferTicketService.createTicket(request.getTransferTicket());
            case "transfer_ticket.update":
                return transferTicketService.updateTicket(request.getTicketId(), request.getTransferTicket());
            case "transfer_ticket.get_by_id":
                return transferTicketService.getTicketById(request.getTicketId());
            case "transfer_ticket.get_by_code":
                return transferTicketService.getTicketByCode(request.getTicketCode());
            case "transfer_ticket.get_all_in_company":
                return transferTicketService.getAllByCompany(request.getCompanyId());
            default:
                throw new RpcException(400, "Unknown transfer ticket event: " + event.getPattern());
        }
    }
}