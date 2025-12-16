package scms.business_service.service.Sales;

import java.time.LocalDateTime;
import java.util.Base64;

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

    boolean existsInvoice = invoiceRepository.existsBySalesOrderSoId(soId);
    if (existsInvoice) {
      throw new RpcException(400, "Đơn hàng này đã được tạo hóa đơn!");
    }

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

  @Transactional
  public InvoiceDto getInvoicePdf(Long id) {
    Invoice invoice = invoiceRepository.findById(id)
        .orElseThrow(() -> new RpcException(404, "Không tìm thấy hóa đơn!"));

    if (invoice.getFile() == null || invoice.getFile().length == 0) {
      if (invoice.getSalesOrder() != null) {
        byte[] pdfBytes = pdfGenerator.generateInvoicePdf(invoice.getSalesOrder());
        invoice.setFile(pdfBytes);
        invoice = invoiceRepository.save(invoice);
      } else {
        throw new RpcException(404, "Hóa đơn chưa có file PDF và không tìm thấy đơn hàng gốc để tạo lại!");
      }
    }

    InvoiceDto dto = new InvoiceDto();
    dto.setInvoiceId(invoice.getInvoiceId());
    dto.setInvoiceCode(invoice.getInvoiceCode());
    dto.setFile(Base64.getEncoder().encodeToString(invoice.getFile()));
    return dto;
  }

  @Transactional
  public InvoiceDto getInvoiceBySo(Long soId) {
    Invoice invoice = invoiceRepository.findBySalesOrderSoId(soId);
    if (invoice == null) {
      return generateInvoice(soId);
    }

    if (invoice.getFile() == null || invoice.getFile().length == 0) {
      SalesOrder salesOrder = salesOrderRepository.findById(soId)
          .orElseThrow(() -> new RpcException(404, "Không tìm thấy đơn bán hàng!"));

      byte[] pdfBytes = pdfGenerator.generateInvoicePdf(salesOrder);
      invoice.setFile(pdfBytes);
      invoice = invoiceRepository.save(invoice);
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
    if (invoice.getFile() != null) {
      dto.setFile(Base64.getEncoder().encodeToString(invoice.getFile()));
    }
    return dto;
  }
}
