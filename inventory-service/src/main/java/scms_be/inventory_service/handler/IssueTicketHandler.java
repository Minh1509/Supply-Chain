package scms_be.inventory_service.handler;

import com.fasterxml.jackson.databind.ObjectMapper;

import scms_be.inventory_service.exception.RpcException;
import scms_be.inventory_service.model.event.GenericEvent;
import scms_be.inventory_service.model.request.IssueTicketRequest;
import scms_be.inventory_service.model.request.IssueReportRequest;
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
        System.out.println("event: " + event);
        switch (event.getPattern()) {
            case "issue_ticket.create":
                IssueTicketRequest createReq = objectMapper.convertValue(event.getData(), IssueTicketRequest.class);
                return issueTicketService.createIssueTicket(createReq.getIssueTicket());
            case "issue_ticket.get_all_in_company":
                IssueTicketRequest getAllReq = objectMapper.convertValue(event.getData(), IssueTicketRequest.class);
                return issueTicketService.getAllInCompany(getAllReq.getCompanyId());
            case "issue_ticket.get_by_id":
                IssueTicketRequest getByIdReq = objectMapper.convertValue(event.getData(), IssueTicketRequest.class);
                return issueTicketService.getById(getByIdReq.getTicketId());
            case "issue_ticket.update":
                IssueTicketRequest updateReq = objectMapper.convertValue(event.getData(), IssueTicketRequest.class);
                return issueTicketService.updateTicket(updateReq.getTicketId(), updateReq.getIssueTicket());
            case "issue_ticket.get_issue_report":
                IssueTicketRequest issueReportReq = objectMapper.convertValue(event.getData(), IssueTicketRequest.class);
                IssueReportRequest reportReq = new IssueReportRequest();
                // Cần map các field từ IssueTicketRequest sang IssueReportRequest
                return issueTicketService.getIssueReport(reportReq, issueReportReq.getCompanyId());
            case "issue_ticket.get_monthly_issue_report":
                IssueTicketRequest monthlyReq = objectMapper.convertValue(event.getData(), IssueTicketRequest.class);
                return issueTicketService.getMonthlyIssueReport(monthlyReq.getCompanyId(), 
                    monthlyReq.getIssueType(), monthlyReq.getWarehouseId());
            case "issue_ticket.get_forecasted_issue":
                IssueTicketRequest forecastReq = objectMapper.convertValue(event.getData(), IssueTicketRequest.class);
                return issueTicketService.getForecastedIssue(forecastReq.getCompanyId(), 
                    forecastReq.getIssueType(), forecastReq.getWarehouseId());
            default:
                throw new RpcException(400, "Unknown issue ticket event: " + event.getPattern());
        }
    }
}