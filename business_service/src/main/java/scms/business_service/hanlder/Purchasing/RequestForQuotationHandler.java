package scms.business_service.hanlder.Purchasing;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import scms.business_service.model.dto.request.Purchasing.RequestForQuotationRequest;
import scms.business_service.service.Purchasing.RequestForQuotationService;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class RequestForQuotationHandler {

  private final RequestForQuotationService rfqService;
  private final ObjectMapper objectMapper;

  public Object handleCreate(Object data) {
    RequestForQuotationRequest request = objectMapper.convertValue(data, RequestForQuotationRequest.class);
    return rfqService.createRFQ(request);
  }

  public Object handleGetById(Object data) {
    Map<String, Object> map = (Map<String, Object>) data;
    Long id = getLongValue(map, "id");
    return rfqService.getById(id);
  }

  public Object handleGetAllInCompany(Object data) {
    Map<String, Object> map = (Map<String, Object>) data;
    Long companyId = getLongValue(map, "companyId");
    return rfqService.getAllByCompany(companyId);
  }

  public Object handleGetAllByRequestedCompany(Object data) {
    Map<String, Object> map = (Map<String, Object>) data;
    Long requestedCompanyId = getLongValue(map, "requestedCompanyId");
    return rfqService.getAllByRequestCompany(requestedCompanyId);
  }

  public Object handleUpdateStatus(Object data) {
    Map<String, Object> map = (Map<String, Object>) data;
    Long id = getLongValue(map, "id");
    String status = (String) map.get("status");
    return rfqService.updateStatus(id, status);
  }

  private Long getLongValue(Map<String, Object> map, String key) {
    Object value = map.get(key);
    if (value instanceof Number) {
      return ((Number) value).longValue();
    }
    return Long.valueOf(value.toString());
  }
}
