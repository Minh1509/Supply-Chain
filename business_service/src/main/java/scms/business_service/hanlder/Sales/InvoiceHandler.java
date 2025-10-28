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
    return invoiceService.createInvoice(soId);
  }

  public Object handleGetById(Object data) {
    Map<String, Object> map = (Map<String, Object>) data;
    Long id = getLongValue(map, "id");
    return invoiceService.getInvoiceById(id);
  }

  public Object handleGetBySoId(Object data) {
    Map<String, Object> map = (Map<String, Object>) data;
    Long soId = getLongValue(map, "soId");
    return invoiceService.getInvoiceBySoId(soId);
  }

  public Object handleGetAllInCompany(Object data) {
    Map<String, Object> map = (Map<String, Object>) data;
    Long companyId = getLongValue(map, "companyId");
    return invoiceService.getAllInvoicesByCompany(companyId);
  }

  private Long getLongValue(Map<String, Object> map, String key) {
    Object value = map.get(key);
    if (value instanceof Number) {
      return ((Number) value).longValue();
    }
    return Long.valueOf(value.toString());
  }
}
