package scms.business_service.hanlder.Sales;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import scms.business_service.model.dto.request.Sales.QuotationRequest;
import scms.business_service.model.dto.request.UpdateStatusRequest;
import scms.business_service.service.Sales.QuotationService;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class QuotationHandler {

  private final QuotationService quotationService;
  private final ObjectMapper objectMapper;

  public Object handleCreate(Object data) {
    QuotationRequest request = objectMapper.convertValue(data, QuotationRequest.class);
    return quotationService.createQuotation(request);
  }

  public Object handleGetById(Object data) {
    Map<String, Object> map = (Map<String, Object>) data;
    Long quotationId = getLongValue(map, "quotationId");
    return quotationService.getQuotationById(quotationId);
  }

  public Object handleGetByRfqId(Object data) {
    Map<String, Object> map = (Map<String, Object>) data;
    Long rfqId = getLongValue(map, "rfqId");
    return quotationService.getQuotationByRfqId(rfqId);
  }

  public Object handleGetAllInCompany(Object data) {
    Map<String, Object> map = (Map<String, Object>) data;
    Long companyId = getLongValue(map, "companyId");
    return quotationService.getAllQuotationsByCompany(companyId);
  }

  public Object handleGetAllByRequestCompany(Object data) {
    Map<String, Object> map = (Map<String, Object>) data;
    Long requestCompanyId = getLongValue(map, "requestCompanyId");
    return quotationService.getAllQuotationsByRequestCompany(requestCompanyId);
  }

  public Object handleUpdateStatus(Object data) {
    Map<String, Object> map = (Map<String, Object>) data;
    Long quotationId = getLongValue(map, "quotationId");
    Map<String, Object> bodyMap = (Map<String, Object>) map.get("body");
    UpdateStatusRequest body = objectMapper.convertValue(bodyMap, UpdateStatusRequest.class);
    return quotationService.updateQuotationStatus(quotationId, body);
  }

  private Long getLongValue(Map<String, Object> map, String key) {
    Object value = map.get(key);
    if (value instanceof Number) {
      return ((Number) value).longValue();
    }
    return Long.valueOf(value.toString());
  }
}
