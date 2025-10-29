package scms_be.inventory_service.handler;

import com.fasterxml.jackson.databind.ObjectMapper;

import scms_be.inventory_service.exception.RpcException;
import scms_be.inventory_service.model.event.GenericEvent;
import scms_be.inventory_service.model.request.IssueTicketRequest;
import scms_be.inventory_service.service.IssueTicketService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class IssueTicketHandler {

    @Autowired
    private IssueTicketService issueTicketService;
    @Autowired
    private ObjectMapper objectMapper;

    public Object handle(GenericEvent event) {
        IssueTicketRequest request = objectMapper.convertValue(event.getData(), IssueTicketRequest.class);
        System.out.println("event: " + event);
        switch (event.getPattern()) {
            case "issue_ticket.create":
                return issueTicketService.createIssueTicket(request.getIssueTicket());
            case "issue_ticket.get_all_in_company":
                return issueTicketService.getAllInCompany(request.getCompanyId());
            case "issue_ticket.get_by_id":
                return issueTicketService.getById(request.getTicketId());
            case "issue_ticket.update":
                return issueTicketService.updateTicket(request.getTicketId(), request.getIssueTicket());
            case "issue_ticket.get_issue_report":
                return issueTicketService.getIssueReport(request.getIssueReport(), request.getCompanyId());
            case "issue_ticket.get_monthly_issue_report":
                return issueTicketService.getMonthlyIssueReport(request.getCompanyId(), 
                    request.getIssueType(), request.getWarehouseId());
            case "issue_ticket.get_forecasted_issue":
                return issueTicketService.getForecastedIssue(request.getCompanyId(), 
                    request.getIssueType(), request.getWarehouseId());
            default:
                throw new RpcException(400, "Unknown issue ticket event: " + event.getPattern());
        }
    }
}