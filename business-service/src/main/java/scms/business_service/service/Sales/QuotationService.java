package scms.business_service.service.Sales;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import scms.business_service.entity.Purchasing.RequestForQuotation;
import scms.business_service.event.publisher.ExternalServicePublisher;
import scms.business_service.model.dto.request.UpdateStatusRequest;
import scms.business_service.model.dto.response.external.CompanyDto;
import scms.business_service.model.dto.response.external.ItemDto;
import scms.business_service.entity.Sales.Quotation;
import scms.business_service.entity.Sales.QuotationDetail;
import scms.business_service.exception.RpcException;
import scms.business_service.model.dto.request.Sales.QuotationDetailRequest;
import scms.business_service.model.dto.request.Sales.QuotationRequest;
import scms.business_service.model.dto.response.Sales.QuotationDetailDto;
import scms.business_service.model.dto.response.Sales.QuotationDto;
import scms.business_service.repository.Purchasing.RequestForQuotationRepository;
import scms.business_service.repository.Sales.QuotationDetailRepository;
import scms.business_service.repository.Sales.QuotationRepository;

@Service
public class QuotationService {

  @Autowired
  private QuotationRepository quotationRepository;

  @Autowired
  private QuotationDetailRepository quotationDetailRepository;

  @Autowired
  private RequestForQuotationRepository rfqRepository;

  @Autowired
  private ExternalServicePublisher externalServicePublisher;

  public QuotationDto createQuotation(QuotationRequest request) {
    RequestForQuotation rfq = rfqRepository.findById(request.getRfqId())
        .orElseThrow(() -> new RpcException(404, "Không tìm thấy yêu cầu báo giá!"));

    if (request.getQuotationDetails() == null || request.getQuotationDetails().isEmpty()) {
      throw new RpcException(400, "Danh sách hàng hóa không được để trống!");
    }

    Quotation quotation = new Quotation();
    quotation.setCompanyId(request.getCompanyId());
    quotation.setRequestCompanyId(request.getRequestCompanyId());
    quotation.setRfq(rfq);
    quotation.setCode(generateQuotationCode(request.getCompanyId(), request.getRequestCompanyId()));
    quotation.setSubTotal(request.getSubTotal());
    quotation.setTaxRate(request.getTaxRate());
    quotation.setTaxAmount(request.getTaxAmount());
    quotation.setTotalAmount(request.getTotalAmount());
    quotation.setCreatedBy(request.getCreatedBy());
    quotation.setStatus(request.getStatus() != null ? request.getStatus() : "Đã tạo");
    quotation.setCreatedOn(LocalDateTime.now());
    quotation.setLastUpdatedOn(LocalDateTime.now());

    Quotation savedQuotation = quotationRepository.save(quotation);

    for (QuotationDetailRequest d : request.getQuotationDetails()) {
      QuotationDetail detail = new QuotationDetail();
      detail.setQuotation(savedQuotation);
      detail.setItemId(d.getItemId());
      detail.setCustomerItemId(d.getCustomerItemId());
      detail.setQuantity(d.getQuantity());
      detail.setItemPrice(d.getItemPrice());
      detail.setDiscount(d.getDiscount());
      detail.setNote(d.getNote());
      quotationDetailRepository.save(detail);
    }

    return convertToDto(savedQuotation);
  }

  public QuotationDto getQuotationById(Long id) {
    Quotation quotation = quotationRepository.findById(id)
        .orElseThrow(() -> new RpcException(404, "Không tìm thấy báo giá!"));
    return convertToDto(quotation);
  }

  public QuotationDto getQuotationByRfqId(Long rfqId) {
    Quotation quotation = quotationRepository.findByRfqId(rfqId);
    if (quotation == null) {
      throw new RpcException(404, "Không tìm thấy báo giá cho RFQ này!");
    }
    return convertToDto(quotation);
  }

  public List<QuotationDto> getAllQuotationsByCompany(Long companyId) {
    return quotationRepository.findByCompanyId(companyId)
        .stream()
        .map(this::convertToDto)
        .collect(Collectors.toList());
  }

  public List<QuotationDto> getAllQuotationsByRequestCompany(Long requestCompanyId) {
    return quotationRepository.findByRequestCompanyId(requestCompanyId)
        .stream()
        .map(this::convertToDto)
        .collect(Collectors.toList());
  }

  public QuotationDto updateQuotationStatus(Long id, UpdateStatusRequest body) {
    Quotation quotation = quotationRepository.findById(id)
        .orElseThrow(() -> new RpcException(404, "Không tìm thấy báo giá!"));
    
    quotation.setStatus(body.getStatus());
    quotation.setLastUpdatedOn(LocalDateTime.now());
    
    return convertToDto(quotationRepository.save(quotation));
  }

  private String generateQuotationCode(Long companyId, Long requestCompanyId) {
    String prefix = "QT" + companyId + requestCompanyId;
    String year = String.valueOf(LocalDateTime.now().getYear()).substring(2);
    int count = quotationRepository.countByCodeStartingWith(prefix);
    return prefix + year + String.format("%04d", count + 1);
  }

  private QuotationDto convertToDto(Quotation quotation) {
    QuotationDto dto = new QuotationDto();
    dto.setId(quotation.getId());
    dto.setCode(quotation.getCode());
    dto.setCompanyId(quotation.getCompanyId());
    dto.setRequestCompanyId(quotation.getRequestCompanyId());
    dto.setRfqId(quotation.getRfq().getId());
    dto.setRfqCode(quotation.getRfq().getCode());
    dto.setSubTotal(quotation.getSubTotal());
    dto.setTaxRate(quotation.getTaxRate());
    dto.setTaxAmount(quotation.getTaxAmount());
    dto.setTotalAmount(quotation.getTotalAmount());
    dto.setCreatedBy(quotation.getCreatedBy());
    dto.setCreatedOn(quotation.getCreatedOn());
    dto.setLastUpdatedOn(quotation.getLastUpdatedOn());
    dto.setStatus(quotation.getStatus());

    // Lấy thông tin company
    CompanyDto company = externalServicePublisher.getCompanyById(quotation.getCompanyId());
    if (company != null) {
      dto.setCompanyCode(company.getCompanyCode());
      dto.setCompanyName(company.getCompanyName());
    }
    
    CompanyDto requestCompany = externalServicePublisher.getCompanyById(quotation.getRequestCompanyId());
    if (requestCompany != null) {
      dto.setRequestCompanyCode(requestCompany.getCompanyCode());
      dto.setRequestCompanyName(requestCompany.getCompanyName());
    }

    List<QuotationDetailDto> details = quotationDetailRepository
        .findByQuotationId(quotation.getId())
        .stream()
        .map(this::convertToDetailDto)
        .collect(Collectors.toList());
    dto.setQuotationDetails(details);

    return dto;
  }

  private QuotationDetailDto convertToDetailDto(QuotationDetail detail) {
    QuotationDetailDto dto = new QuotationDetailDto();
    dto.setId(detail.getId());
    dto.setQuotationId(detail.getQuotation().getId());
    dto.setQuotationCode(detail.getQuotation().getCode());
    dto.setItemId(detail.getItemId());
    dto.setCustomerItemId(detail.getCustomerItemId());
    dto.setQuantity(detail.getQuantity());
    dto.setItemPrice(detail.getItemPrice());
    dto.setDiscount(detail.getDiscount());
    dto.setNote(detail.getNote());
    
    // Lấy thông tin item
    ItemDto item = externalServicePublisher.getItemById(detail.getItemId());
    if (item != null) {
      dto.setItemCode(item.getItemCode());
      dto.setItemName(item.getItemName());
    }
    
    ItemDto customerItem = externalServicePublisher.getItemById(detail.getCustomerItemId());
    if (customerItem != null) {
      dto.setCustomerItemName(customerItem.getItemName());
    }
    
    return dto;
  }
}
