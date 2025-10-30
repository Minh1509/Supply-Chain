package scms.business_service.hanlder.Purchasing;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import scms.business_service.model.dto.request.Purchasing.PurchaseOrderRequest;
import scms.business_service.model.dto.request.Purchasing.PurchaseReportRequest;
import scms.business_service.model.dto.request.UpdateStatusRequest;
import scms.business_service.service.Purchasing.PurchaseOrderService;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class PurchaseOrderHandler {

  private final PurchaseOrderService purchaseOrderService;
  private final ObjectMapper objectMapper;

  public Object handleCreate(Object data) {
    PurchaseOrderRequest request = objectMapper.convertValue(data, PurchaseOrderRequest.class);
    return purchaseOrderService.createPurchaseOrder(request);
  }

  public Object handleGetById(Object data) {
    Map<String, Object> map = (Map<String, Object>) data;
    Long id = getLongValue(map, "id");
    return purchaseOrderService.getPurchaseOrderById(id);
  }

  public Object handleGetAllInCompany(Object data) {
    Map<String, Object> map = (Map<String, Object>) data;
    Long companyId = getLongValue(map, "companyId");
    return purchaseOrderService.getAllPoByCompany(companyId);
  }

  public Object handleGetAllBySupplier(Object data) {
    Map<String, Object> map = (Map<String, Object>) data;
    Long supplierCompanyId = getLongValue(map, "supplierCompanyId");
    return purchaseOrderService.getAllPoBySupplierCompany(supplierCompanyId);
  }

  public Object handleUpdateStatus(Object data) {
    Map<String, Object> map = (Map<String, Object>) data;
    Long id = getLongValue(map, "id");
    Map<String, Object> bodyMap = (Map<String, Object>) map.get("body");
    UpdateStatusRequest body = objectMapper.convertValue(bodyMap, UpdateStatusRequest.class);
    return purchaseOrderService.updatePoStatus(id, body);
  }

  public Object handlePurchaseReport(Object data) {
    Map<String, Object> map = (Map<String, Object>) data;
    Long companyId = getLongValue(map, "companyId");
    Map<String, Object> reqMap = (Map<String, Object>) map.get("request");
    PurchaseReportRequest request = objectMapper.convertValue(reqMap, PurchaseReportRequest.class);
    return purchaseOrderService.getPurchaseReport(request, companyId);
  }

  public Object handleMonthlyReport(Object data) {
    Map<String, Object> map = (Map<String, Object>) data;
    Long companyId = getLongValue(map, "companyId");
    return purchaseOrderService.getMonthlyPurchaseReport(companyId);
  }

  private Long getLongValue(Map<String, Object> map, String key) {
    Object value = map.get(key);
    if (value instanceof Number) {
      return ((Number) value).longValue();
    }
    return Long.valueOf(value.toString());
  }
}
