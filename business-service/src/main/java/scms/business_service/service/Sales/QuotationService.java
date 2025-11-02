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

import java.util.concurrent.*;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;


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

    Quotation existingQuotation = quotationRepository.findByRfqRfqId(request.getRfqId());
    if (existingQuotation != null) {
      throw new RpcException(400, "Yêu cầu báo giá này đã có báo giá. Không thể tạo mới!");
    }

    Quotation quotation = new Quotation();
    quotation.setCompanyId(request.getCompanyId());
    quotation.setRequestCompanyId(request.getRequestCompanyId());
    quotation.setRfq(rfq);
    quotation.setQuotationCode(generateQuotationCode(request.getCompanyId(), request.getRequestCompanyId()));
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
    Quotation quotation = quotationRepository.findByRfqRfqId(rfqId);
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
    int count = quotationRepository.countByQuotationCodeStartingWith(prefix);
    return prefix + year + String.format("%04d", count + 1);
  }

  private QuotationDto convertToDto(Quotation quotation) {
    QuotationDto dto = new QuotationDto();
    dto.setQuotationId(quotation.getQuotationId());
    dto.setQuotationCode(quotation.getQuotationCode());
    dto.setCompanyId(quotation.getCompanyId());
    dto.setRequestCompanyId(quotation.getRequestCompanyId());
    dto.setRfqId(quotation.getRfq().getRfqId());
    dto.setRfqCode(quotation.getRfq().getRfqCode());
    dto.setSubTotal(quotation.getSubTotal());
    dto.setTaxRate(quotation.getTaxRate());
    dto.setTaxAmount(quotation.getTaxAmount());
    dto.setTotalAmount(quotation.getTotalAmount());
    dto.setCreatedBy(quotation.getCreatedBy());
    dto.setCreatedOn(quotation.getCreatedOn());
    dto.setLastUpdatedOn(quotation.getLastUpdatedOn());
    dto.setStatus(quotation.getStatus());

    // Tạo thread pool riêng (giới hạn 5 luồng để tránh quá tải)
    ExecutorService executor = Executors.newFixedThreadPool(10);

    CompletableFuture<CompanyDto> companyFuture = CompletableFuture.supplyAsync(
            () -> externalServicePublisher.getCompanyById(quotation.getCompanyId()), executor);

    CompletableFuture<CompanyDto> requestCompanyFuture = CompletableFuture.supplyAsync(
            () -> externalServicePublisher.getCompanyById(quotation.getRequestCompanyId()), executor);

    List<QuotationDetail> detailList = quotationDetailRepository.findByQuotationQuotationId(quotation.getQuotationId());

    Set<Long> itemIds = detailList.stream()
            .flatMap(d -> Stream.of(d.getItemId(), d.getCustomerItemId()))
            .filter(Objects::nonNull)
            .collect(Collectors.toSet());

    Map<Long, CompletableFuture<ItemDto>> itemFutures = itemIds.stream()
            .collect(Collectors.toMap(
                    id -> id,
                    id -> CompletableFuture.supplyAsync(() -> externalServicePublisher.getItemById(id), executor)
            ));

    CompanyDto company = companyFuture.join();
    CompanyDto requestCompany = requestCompanyFuture.join();

    if (company != null) {
      dto.setCompanyCode(company.getCompanyCode());
      dto.setCompanyName(company.getCompanyName());
    }

    if (requestCompany != null) {
      dto.setRequestCompanyCode(requestCompany.getCompanyCode());
      dto.setRequestCompanyName(requestCompany.getCompanyName());
    }

    List<QuotationDetailDto> detailDtos = detailList.parallelStream()
            .map(detail -> {
              QuotationDetailDto d = new QuotationDetailDto();
              d.setQuotationDetailId(detail.getQuotationDetailId());
              d.setQuotationId(quotation.getQuotationId());
              d.setItemId(detail.getItemId());
              d.setCustomerItemId(detail.getCustomerItemId());
              d.setQuantity(detail.getQuantity());
              d.setItemPrice(detail.getItemPrice());
              d.setDiscount(detail.getDiscount());
              d.setNote(detail.getNote());

              // Lấy item từ cache future
              ItemDto item = itemFutures.get(detail.getItemId()).join();
              if (item != null) {
                d.setItemCode(item.getItemCode());
                d.setItemName(item.getItemName());
              }

              ItemDto customerItem = itemFutures.get(detail.getCustomerItemId()).join();
              if (customerItem != null) {
                d.setCustomerItemCode(customerItem.getItemCode());
                d.setCustomerItemName(customerItem.getItemName());
              }

              return d;
            })
            .collect(Collectors.toList());

    dto.setQuotationDetails(detailDtos);

    executor.shutdown();
    return dto;
  }

}
