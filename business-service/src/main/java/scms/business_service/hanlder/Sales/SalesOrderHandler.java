package scms.business_service.hanlder.Sales;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import scms.business_service.model.dto.request.Sales.SalesOrderRequest;
import scms.business_service.model.dto.request.Sales.SalesReportRequest;
import scms.business_service.model.dto.request.UpdateStatusRequest;
import scms.business_service.service.Sales.SalesOrderService;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class SalesOrderHandler {

  private final SalesOrderService salesOrderService;
  private final ObjectMapper objectMapper;

  public Object handleCreate(Object data) {
    SalesOrderRequest request = objectMapper.convertValue(data, SalesOrderRequest.class);
    return salesOrderService.createSalesOrder(request);
  }

  public Object handleGetById(Object data) {
    Map<String, Object> map = (Map<String, Object>) data;
    Long id = getLongValue(map, "id");
    return salesOrderService.getSalesOrderById(id);
  }

  public Object handleGetByPoId(Object data) {
    Map<String, Object> map = (Map<String, Object>) data;
    Long poId = getLongValue(map, "poId");
    return salesOrderService.getSalesOrderByPoId(poId);
  }

  public Object handleGetAllInCompany(Object data) {
    Map<String, Object> map = (Map<String, Object>) data;
    Long companyId = getLongValue(map, "companyId");
    return salesOrderService.getAllSalesOrdersByCompany(companyId);
  }

  public Object handleUpdateStatus(Object data) {
    Map<String, Object> map = (Map<String, Object>) data;
    Long id = getLongValue(map, "id");
    Map<String, Object> bodyMap = (Map<String, Object>) map.get("body");
    UpdateStatusRequest body = objectMapper.convertValue(bodyMap, UpdateStatusRequest.class);
    return salesOrderService.updateSoStatus(id, body);
  }

  public Object handleSalesReport(Object data) {
    Map<String, Object> map = (Map<String, Object>) data;
    Long companyId = getLongValue(map, "companyId");
    SalesReportRequest request = objectMapper.convertValue(map, SalesReportRequest.class);
    return salesOrderService.getSalesReport(request, companyId);
  }

  public Object handleMonthlyReport(Object data) {
    Map<String, Object> map = (Map<String, Object>) data;
    Long companyId = getLongValue(map, "companyId");
    return salesOrderService.getMonthlySalesReport(companyId);
  }

  private Long getLongValue(Map<String, Object> map, String key) {
    Object value = map.get(key);
    if (value instanceof Number) {
      return ((Number) value).longValue();
    }
    return Long.valueOf(value.toString());
  }
}
