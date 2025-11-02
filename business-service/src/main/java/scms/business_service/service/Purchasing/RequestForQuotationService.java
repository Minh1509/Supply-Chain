package scms.business_service.service.Purchasing;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import scms.business_service.entity.Purchasing.RfqDetail;
import scms.business_service.event.publisher.ExternalServicePublisher;
import scms.business_service.model.dto.request.UpdateStatusRequest;
import scms.business_service.model.dto.response.external.CompanyDto;
import scms.business_service.model.dto.response.external.ItemDto;
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

  @Autowired
  private ExternalServicePublisher externalServicePublisher;

  public RequestForQuotationDto createRFQ(RequestForQuotationRequest request) {
    // Validate input
    if (request.getRfqDetails() == null || request.getRfqDetails().isEmpty()) {
      throw new RpcException(400, "Danh sách hàng hóa không được để trống!");
    }

    // Create RFQ - chỉ lưu ID của Company (không validate vì ở service khác)
    RequestForQuotation rfq = new RequestForQuotation();
    rfq.setCompanyId(request.getCompanyId());
    rfq.setRequestedCompanyId(request.getRequestedCompanyId());
    rfq.setRfqCode(generateRFQCode(request.getCompanyId(), request.getRequestedCompanyId()));
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

  public RequestForQuotationDto updateStatus(Long id, UpdateStatusRequest body) {
    RequestForQuotation rfq = rfqRepository.findById(id)
        .orElseThrow(() -> new RpcException(404, "Không tìm thấy yêu cầu báo giá!"));
    rfq.setStatus(body.getStatus());
    rfq.setLastUpdatedOn(LocalDateTime.now());
    return convertToDto(rfqRepository.save(rfq));
  }

  private String generateRFQCode(Long companyId, Long requestedCompanyId) {
    String prefix = "RFQ" + companyId + requestedCompanyId;
    String year = String.valueOf(LocalDateTime.now().getYear()).substring(2);
    int count = rfqRepository.countByRfqCodeStartingWith(prefix);
    return prefix + year + String.format("%04d", count + 1);
  }

  private RequestForQuotationDto convertToDto(RequestForQuotation rfq) {
    RequestForQuotationDto dto = new RequestForQuotationDto();
    dto.setRfqId(rfq.getRfqId());
    dto.setRfqCode(rfq.getRfqCode());
    dto.setCompanyId(rfq.getCompanyId());
    dto.setRequestedCompanyId(rfq.getRequestedCompanyId());
    dto.setNeedByDate(rfq.getNeedByDate());
    dto.setCreatedBy(rfq.getCreatedBy());
    dto.setCreatedOn(rfq.getCreatedOn());
    dto.setLastUpdatedOn(rfq.getLastUpdatedOn());
    dto.setStatus(rfq.getStatus());

    // Lấy thông tin company
    CompanyDto company = externalServicePublisher.getCompanyById(rfq.getCompanyId());
    if (company != null) {
      dto.setCompanyCode(company.getCompanyCode());
      dto.setCompanyName(company.getCompanyName());
    }
    
    CompanyDto requested = externalServicePublisher.getCompanyById(rfq.getRequestedCompanyId());
    if (requested != null) {
      dto.setRequestedCompanyCode(requested.getCompanyCode());
      dto.setRequestedCompanyName(requested.getCompanyName());
    }

    List<RfqDetailDto> rfqDetails = rfqDetailRepository
        .findByRfqRfqId(rfq.getRfqId())
        .stream()
        .map(this::convertToDetailDto)
        .collect(Collectors.toList());
    dto.setRfqDetails(rfqDetails);
    return dto;
  }

  public RfqDetailDto convertToDetailDto(RfqDetail rfqDetail) {
    RfqDetailDto dto = new RfqDetailDto();
    dto.setRfqDetailId(rfqDetail.getRfqDetailId());
    dto.setRfqId(rfqDetail.getRfq().getRfqId());
    dto.setRfqCode(rfqDetail.getRfq().getRfqCode());
    dto.setItemId(rfqDetail.getItemId());
    dto.setSupplierItemId(rfqDetail.getSupplierItemId());
    dto.setQuantity(rfqDetail.getQuantity());
    dto.setNote(rfqDetail.getNote());
    
    // Lấy thông tin item
    ItemDto item = externalServicePublisher.getItemById(rfqDetail.getItemId());
    if (item != null) {
      dto.setItemCode(item.getItemCode());
      dto.setItemName(item.getItemName());
    }
    
    ItemDto supplierItem = externalServicePublisher.getItemById(rfqDetail.getSupplierItemId());
    if (supplierItem != null) {
      dto.setSupplierItemCode(supplierItem.getItemCode());
      dto.setSupplierItemName(supplierItem.getItemName());
      dto.setSupplierItemPrice(supplierItem.getImportPrice());
    }
    
    return dto;
  }
}
