package scms_be.inventory_service.handler;

import com.fasterxml.jackson.databind.ObjectMapper;

import scms_be.inventory_service.exception.RpcException;
import scms_be.inventory_service.model.event.GenericEvent;
import scms_be.inventory_service.model.request.ReceiveReportRequest;
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
        System.out.println("event: " + event);
        switch (event.getPattern()) {
            case "receive_ticket.create":
                ReceiveTicketRequest createReq = objectMapper.convertValue(event.getData(), ReceiveTicketRequest.class);
                return receiveTicketService.create(createReq.getReceiveTicket());
            case "receive_ticket.update":
                ReceiveTicketRequest updateReq = objectMapper.convertValue(event.getData(), ReceiveTicketRequest.class);
                return receiveTicketService.update(updateReq.getTicketId(), updateReq.getReceiveTicket());
            case "receive_ticket.get_by_id":
                ReceiveTicketRequest getByIdReq = objectMapper.convertValue(event.getData(), ReceiveTicketRequest.class);
                return receiveTicketService.getById(getByIdReq.getTicketId());
            case "receive_ticket.get_all_in_company":
                ReceiveTicketRequest getAllReq = objectMapper.convertValue(event.getData(), ReceiveTicketRequest.class);
                return receiveTicketService.getAllInCompany(getAllReq.getCompanyId());
            case "receive_ticket.get_receive_report":
                // Note: This requires both ReceiveReportRequest and companyId, may need special handling
                ReceiveTicketRequest reportReq = objectMapper.convertValue(event.getData(), ReceiveTicketRequest.class);
                ReceiveReportRequest receiveReportReq = objectMapper.convertValue(event.getData(), ReceiveReportRequest.class);
                return receiveTicketService.getReceiveReport(receiveReportReq, reportReq.getCompanyId());
            case "receive_ticket.get_monthly_report":
                ReceiveTicketRequest monthlyReq = objectMapper.convertValue(event.getData(), ReceiveTicketRequest.class);
                return receiveTicketService.getMonthlyReceiveReport(monthlyReq.getCompanyId(), 
                    monthlyReq.getReceiveType(), monthlyReq.getWarehouseId());
            default:
                throw new RpcException(400, "Unknown receive ticket event: " + event.getPattern());
        }
    }
}