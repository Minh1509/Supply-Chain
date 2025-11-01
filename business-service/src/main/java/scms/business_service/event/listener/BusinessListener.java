package scms.business_service.event.listener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import scms.business_service.exception.RpcException;
import scms.business_service.hanlder.Purchasing.PurchaseOrderHandler;
import scms.business_service.hanlder.Purchasing.RequestForQuotationHandler;
import scms.business_service.hanlder.Sales.QuotationHandler;
import scms.business_service.hanlder.Sales.SalesOrderHandler;
import scms.business_service.hanlder.Sales.InvoiceHandler;
import scms.business_service.model.ErrorResponse;
import scms.business_service.model.event.BusinessEvent;

@Slf4j
@Service
@RequiredArgsConstructor
public class BusinessListener {

    private final PurchaseOrderHandler purchaseOrderHandler;
    private final RequestForQuotationHandler rfqHandler;
    private final SalesOrderHandler salesOrderHandler;
    private final QuotationHandler quotationHandler;
    private final InvoiceHandler invoiceHandler;

    @RabbitListener(queues = "business_queue")
    public Object handleEvents(BusinessEvent event) {
        try {
            log.info("Received event with pattern: {}", event.getPattern());
            
            return switch (event.getPattern()) {
                // Purchase Order patterns
                case "po.create" -> purchaseOrderHandler.handleCreate(event.getData());
                case "po.get_by_id" -> purchaseOrderHandler.handleGetById(event.getData());
                case "po.get_by_code" -> purchaseOrderHandler.handleGetByCode(event.getData());
                case "po.get_all_in_company" -> purchaseOrderHandler.handleGetAllInCompany(event.getData());
                case "po.get_all_by_supplier" -> purchaseOrderHandler.handleGetAllBySupplier(event.getData());
                case "po.update_status" -> purchaseOrderHandler.handleUpdateStatus(event.getData());
                case "po.purchase_report" -> purchaseOrderHandler.handlePurchaseReport(event.getData());
                case "po.monthly_report" -> purchaseOrderHandler.handleMonthlyReport(event.getData());
                
                // Request for Quotation patterns
                case "rfq.create" -> rfqHandler.handleCreate(event.getData());
                case "rfq.get_by_id" -> rfqHandler.handleGetById(event.getData());
                case "rfq.get_all_in_company" -> rfqHandler.handleGetAllInCompany(event.getData());
                case "rfq.get_all_by_requested_company" -> rfqHandler.handleGetAllByRequestedCompany(event.getData());
                case "rfq.update_status" -> rfqHandler.handleUpdateStatus(event.getData());
                
                // Sales Order patterns
                case "so.create" -> salesOrderHandler.handleCreate(event.getData());
                case "so.get_by_id" -> salesOrderHandler.handleGetById(event.getData());
                case "so.get_by_code" -> salesOrderHandler.handleGetByCode(event.getData());
                case "so.get_by_po_id" -> salesOrderHandler.handleGetByPoId(event.getData());
                case "so.get_all_in_company" -> salesOrderHandler.handleGetAllInCompany(event.getData());
                case "so.update_status" -> salesOrderHandler.handleUpdateStatus(event.getData());
                case "so.sales_report" -> salesOrderHandler.handleSalesReport(event.getData());
                case "so.monthly_report" -> salesOrderHandler.handleMonthlyReport(event.getData());
                
                // Quotation patterns
                case "quotation.create" -> quotationHandler.handleCreate(event.getData());
                case "quotation.get_by_id" -> quotationHandler.handleGetById(event.getData());
                case "quotation.get_by_rfq_id" -> quotationHandler.handleGetByRfqId(event.getData());
                case "quotation.get_all_in_company" -> quotationHandler.handleGetAllInCompany(event.getData());
                case "quotation.get_all_by_request_company" -> quotationHandler.handleGetAllByRequestCompany(event.getData());
                case "quotation.update_status" -> quotationHandler.handleUpdateStatus(event.getData());
                
                // Invoice patterns
                case "invoice.create" -> invoiceHandler.handleCreate(event.getData());
                case "invoice.get_pdf_by_id" -> invoiceHandler.handleGetPdfById(event.getData());
                case "invoice.get_pdf_by_so_id" -> invoiceHandler.handleGetPdfBySoId(event.getData());
                
                default -> {
                    log.warn("Unknown event pattern: {}", event.getPattern());
                    throw new RpcException(400, "Unknown event pattern: " + event.getPattern());
                }
            };
        } catch (RpcException ex) {
            log.error("RPC Exception: {}", ex.getMessage());
            return new ErrorResponse(ex.getStatusCode(), ex.getMessage());
        } catch (Exception ex) {
            log.error("Unexpected error handling event: ", ex);
            return new ErrorResponse(500, "Internal error: " + ex.getMessage());
        }
    }
}