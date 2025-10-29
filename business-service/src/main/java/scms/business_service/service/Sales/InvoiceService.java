package scms.business_service.service.Sales;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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

  public InvoiceDto createInvoice(Long soId) {
    SalesOrder salesOrder = salesOrderRepository.findById(soId)
        .orElseThrow(() -> new RpcException(404, "Không tìm thấy đơn bán hàng!"));

    Invoice existingInvoice = invoiceRepository.findBySalesOrderId(salesOrder.getId());
    if (existingInvoice != null) {
      throw new RpcException(400, "Hóa đơn cho đơn bán hàng này đã tồn tại!");
    }

    Invoice invoice = new Invoice();
    invoice.setSalesCompanyId(salesOrder.getCompanyId());
    invoice.setPurchaseCompanyId(salesOrder.getCustomerCompanyId());
    invoice.setSalesOrder(salesOrder);
    invoice.setCode(generateInvoiceCode(salesOrder.getId()));
    invoice.setPaymentMethod(salesOrder.getPaymentMethod());
    invoice.setCreatedOn(LocalDateTime.now());

    try {
      byte[] pdfBytes = pdfGenerator.generateInvoicePdf(salesOrder);
      invoice.setFile(pdfBytes);
    } catch (Exception e) {
      throw new RpcException(500, "Lỗi khi tạo file PDF hóa đơn: " + e.getMessage());
    }

    Invoice savedInvoice = invoiceRepository.save(invoice);
    return convertToDto(savedInvoice);
  }

  public InvoiceDto getInvoicePdfById(Long id) {
    Invoice invoice = invoiceRepository.findById(id)
        .orElseThrow(() -> new RpcException(404, "Không tìm thấy hóa đơn!"));
    return convertToDto(invoice);
  }

  public InvoiceDto getInvoicePdfBySoId(Long soId) {
    Invoice invoice = invoiceRepository.findBySalesOrderId(soId);
    if (invoice == null) {
      throw new RpcException(404, "Không tìm thấy hóa đơn cho đơn bán hàng này!");
    }
    return convertToDto(invoice);
  }

  private String generateInvoiceCode(Long soId) {
    String prefix = "INV" + soId;
    String year = String.valueOf(LocalDateTime.now().getYear()).substring(2);
    int count = invoiceRepository.countByCodeStartingWith(prefix);
    return prefix + year + String.format("%04d", count + 1);
  }

  private InvoiceDto convertToDto(Invoice invoice) {
    InvoiceDto dto = new InvoiceDto();
    dto.setId(invoice.getId());
    dto.setCode(invoice.getCode());
//    dto.setSalesCompanyId(invoice.getSalesCompanyId());
//    dto.setPurchaseCompanyId(invoice.getPurchaseCompanyId());
//    dto.setSoId(invoice.getSalesOrder().getId());
//    dto.setSoCode(invoice.getSalesOrder().getCode());
//    dto.setPaymentMethod(invoice.getPaymentMethod());
//    dto.setCreatedOn(invoice.getCreatedOn());
    dto.setFile(invoice.getFile());
    return dto;
  }
}
