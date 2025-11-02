package scms.business_service.service.Sales;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;

import jakarta.transaction.Transactional;
import scms.business_service.entity.Sales.Invoice;
import scms.business_service.entity.Sales.SalesOrder;
import scms.business_service.exception.RpcException;
import scms.business_service.model.dto.response.Sales.InvoiceDto;
import scms.business_service.repository.Sales.InvoiceRepository;
import scms.business_service.repository.Sales.SalesOrderRepository;

@Service
public class InvoiceService {

  @Autowired
  private InvoiceRepository invoiceRepository;

  @Autowired
  private SalesOrderRepository salesOrderRepository;

  @Autowired
  private InvoicePdfGenerator pdfGenerator;

  @Transactional
  public InvoiceDto generateInvoice(Long soId) {
    SalesOrder salesOrder = salesOrderRepository.findById(soId)
        .orElseThrow(() -> new RpcException(404, "Không tìm thấy đơn bán hàng!"));

    Invoice invoice = new Invoice();
    invoice.setSalesCompanyId(salesOrder.getCompanyId());
    invoice.setPurchaseCompanyId(salesOrder.getCustomerCompanyId());
    invoice.setSalesOrder(salesOrder);
    invoice.setInvoiceCode(generateInvoiceCode(salesOrder.getCompanyId()));
    invoice.setPaymentMethod(salesOrder.getPaymentMethod());
    invoice.setCreatedOn(LocalDateTime.now());

    byte[] pdfBytes = pdfGenerator.generateInvoicePdf(salesOrder);
    invoice.setFile(pdfBytes);

    Invoice savedInvoice = invoiceRepository.save(invoice);
    return convertToDto(savedInvoice);
  }

  public ResponseEntity<byte[]>  getInvoicePdf(Long id) {
    Invoice invoice = invoiceRepository.findById(id)
            .orElseThrow(() -> new RpcException(404, "Không tìm thấy hóa đơn!"));

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_PDF);
    headers.setContentDisposition(ContentDisposition.inline().filename(invoice.getInvoiceCode() + ".pdf").build());

    return new ResponseEntity<>(invoice.getFile(), headers, HttpStatus.OK);
  }

  public InvoiceDto getInvoiceBySo(Long soId) {
    Invoice invoice = invoiceRepository.findBySalesOrderSoId(soId);
    if (invoice == null) {
      return generateInvoice(soId);
    }
    return convertToDto(invoice);
  }

  private String generateInvoiceCode(Long companyId) {
    String prefix = "I" + String.format("%04d", companyId);
    String year = String.valueOf(LocalDateTime.now().getYear()).substring(2);
    int count = invoiceRepository.countByInvoiceCodeStartingWith(prefix);
    return prefix + year + String.format("%03d", count + 1);
  }

  private InvoiceDto convertToDto(Invoice invoice) {
    InvoiceDto dto = new InvoiceDto();
    dto.setInvoiceId(invoice.getInvoiceId());
    dto.setInvoiceCode(invoice.getInvoiceCode());
    dto.setFile(invoice.getFile());
    return dto;
  }
}
