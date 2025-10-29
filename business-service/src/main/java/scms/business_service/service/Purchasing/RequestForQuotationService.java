package scms.business_service.service.Purchasing;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import scms.business_service.entity.Purchasing.RfqDetail;
import scms.business_service.entity.Purchasing.RequestForQuotation;
import scms.business_service.exception.RpcException;
import scms.business_service.model.dto.request.Purchasing.RequestForQuotationRequest;
import scms.business_service.model.dto.request.Purchasing.RfqDetailRequest;
import scms.business_service.model.dto.response.Purchasing.RequestForQuotationDto;
import scms.business_service.model.dto.response.Purchasing.RfqDetailDto;
import scms.business_service.repository.Purchasing.RfqDetailRepository;
import scms.business_service.repository.Purchasing.RequestForQuotationRepository;

@Service
public class RequestForQuotationService {

  @Autowired
  private RequestForQuotationRepository rfqRepository;

  @Autowired
  private RfqDetailRepository rfqDetailRepository;

  public RequestForQuotationDto createRFQ(RequestForQuotationRequest request) {
    // Validate input
    if (request.getRfqDetails() == null || request.getRfqDetails().isEmpty()) {
      throw new RpcException(400, "Danh sách hàng hóa không được để trống!");
    }

    // Create RFQ - chỉ lưu ID của Company (không validate vì ở service khác)
    RequestForQuotation rfq = new RequestForQuotation();
    rfq.setCompanyId(request.getCompanyId());
    rfq.setRequestedCompanyId(request.getRequestedCompanyId());
    rfq.setCode(generateRFQCode(request.getCompanyId(), request.getRequestedCompanyId()));
    rfq.setNeedByDate(request.getNeedByDate());
    rfq.setCreatedBy(request.getCreatedBy());
    rfq.setCreatedOn(LocalDateTime.now());
    rfq.setLastUpdatedOn(LocalDateTime.now());
    rfq.setStatus(request.getStatus() != null ? request.getStatus() : "Chưa báo giá");

    RequestForQuotation savedRFQ = rfqRepository.save(rfq);

    // Create RFQ details - chỉ lưu itemId (không validate Item)
    for (RfqDetailRequest d : request.getRfqDetails()) {
      RfqDetail detail = new RfqDetail();
      detail.setRfq(savedRFQ);
      detail.setItemId(d.getItemId());
      detail.setSupplierItemId(d.getSupplierItemId());
      detail.setQuantity(d.getQuantity());
      detail.setNote(d.getNote());
      rfqDetailRepository.save(detail);
    }

    return convertToDto(savedRFQ);
  }

  private void checkAndUpdateExpiredRfq(RequestForQuotation rfq) {
    if ("Chưa báo giá".equals(rfq.getStatus()) &&
        rfq.getNeedByDate() != null &&
        rfq.getNeedByDate().isBefore(LocalDateTime.now())) {
      rfq.setStatus("Quá hạn báo giá");
      rfqRepository.save(rfq);
    }
  }

  public List<RequestForQuotationDto> getAllByCompany(Long companyId) {
    return rfqRepository.findByCompanyId(companyId)
        .stream()
        .peek(this::checkAndUpdateExpiredRfq)
        .map(this::convertToDto)
        .collect(Collectors.toList());
  }

  public List<RequestForQuotationDto> getAllByRequestCompany(Long requestedCompanyId) {
    return rfqRepository.findByRequestedCompanyId(requestedCompanyId)
        .stream()
        .peek(this::checkAndUpdateExpiredRfq)
        .map(this::convertToDto)
        .collect(Collectors.toList());
  }

  public RequestForQuotationDto getById(Long id) {
    RequestForQuotation rfq = rfqRepository.findById(id)
        .orElseThrow(() -> new RpcException(404, "Không tìm thấy yêu cầu báo giá!"));
    checkAndUpdateExpiredRfq(rfq);
    return convertToDto(rfq);
  }

  public RequestForQuotationDto updateStatus(Long id, String status) {
    RequestForQuotation rfq = rfqRepository.findById(id)
        .orElseThrow(() -> new RpcException(404, "Không tìm thấy yêu cầu báo giá!"));
    rfq.setStatus(status);
    rfq.setLastUpdatedOn(LocalDateTime.now());
    return convertToDto(rfqRepository.save(rfq));
  }

  private String generateRFQCode(Long companyId, Long requestedCompanyId) {
    String prefix = "RFQ" + companyId + requestedCompanyId;
    String year = String.valueOf(LocalDateTime.now().getYear()).substring(2);
    int count = rfqRepository.countByCodeStartingWith(prefix);
    return prefix + year + String.format("%04d", count + 1);
  }

  private RequestForQuotationDto convertToDto(RequestForQuotation rfq) {
    RequestForQuotationDto dto = new RequestForQuotationDto();
    dto.setId(rfq.getId());  // DTO giữ tên cũ
    dto.setCode(rfq.getCode());
    dto.setCompanyId(rfq.getCompanyId());
    dto.setRequestedCompanyId(rfq.getRequestedCompanyId());
    dto.setNeedByDate(rfq.getNeedByDate());
    dto.setCreatedBy(rfq.getCreatedBy());
    dto.setCreatedOn(rfq.getCreatedOn());
    dto.setLastUpdatedOn(rfq.getLastUpdatedOn());
    dto.setStatus(rfq.getStatus());

    List<RfqDetailDto> rfqDetails = rfqDetailRepository
        .findByRfqId(rfq.getId())
        .stream()
        .map(this::convertToDetailDto)
        .collect(Collectors.toList());
    dto.setRfqDetails(rfqDetails);
    return dto;
  }

  public RfqDetailDto convertToDetailDto(RfqDetail rfqDetail) {
    RfqDetailDto dto = new RfqDetailDto();
    dto.setId(rfqDetail.getId());  // DTO giữ tên cũ
    dto.setRfqId(rfqDetail.getRfq().getId());
    dto.setRfqCode(rfqDetail.getRfq().getCode());
    dto.setItemId(rfqDetail.getItemId());
    dto.setSupplierItemId(rfqDetail.getSupplierItemId());
    dto.setQuantity(rfqDetail.getQuantity());
    dto.setNote(rfqDetail.getNote());
    return dto;
  }
}
