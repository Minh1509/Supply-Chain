package scms.business_service.hanlder.Sales;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import scms.business_service.service.Sales.InvoiceService;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class InvoiceHandler {

  private final InvoiceService invoiceService;
  private final ObjectMapper objectMapper;

  public Object handleCreate(Object data) {
    Map<String, Object> map = (Map<String, Object>) data;
    Long soId = getLongValue(map, "soId");
    return invoiceService.generateInvoice(soId);
  }

  public Object handleGetPdfById(Object data) {
    Map<String, Object> map = (Map<String, Object>) data;
    Long invoiceId = getLongValue(map, "invoiceId");
    return invoiceService.getInvoiceBySo(invoiceId);
  }

  public Object handleGetPdfBySoId(Object data) {
    Map<String, Object> map = (Map<String, Object>) data;
    Long soId = getLongValue(map, "soId");
    return invoiceService.getInvoiceBySo(soId);
  }

  private Long getLongValue(Map<String, Object> map, String key) {
    Object value = map.get(key);
    if (value instanceof Number) {
      return ((Number) value).longValue();
    }
    return Long.valueOf(value.toString());
  }
}
