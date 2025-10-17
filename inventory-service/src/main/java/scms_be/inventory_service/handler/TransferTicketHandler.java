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
        System.out.println("event: " + event);
        switch (event.getPattern()) {
            case "transfer_ticket.create":
                TransferTicketRequest createReq = objectMapper.convertValue(event.getData(), TransferTicketRequest.class);
                return transferTicketService.createTicket(createReq.getTransferTicket());
            case "transfer_ticket.update":
                TransferTicketRequest updateReq = objectMapper.convertValue(event.getData(), TransferTicketRequest.class);
                return transferTicketService.updateTicket(updateReq.getTicketId(), updateReq.getTransferTicket());
            case "transfer_ticket.get_by_id":
                TransferTicketRequest getByIdReq = objectMapper.convertValue(event.getData(), TransferTicketRequest.class);
                return transferTicketService.getTicketById(getByIdReq.getTicketId());
            case "transfer_ticket.get_all_by_company":
                TransferTicketRequest getAllReq = objectMapper.convertValue(event.getData(), TransferTicketRequest.class);
                return transferTicketService.getAllByCompany(getAllReq.getCompanyId());
            default:
                throw new RpcException(400, "Unknown transfer ticket event: " + event.getPattern());
        }
    }
}