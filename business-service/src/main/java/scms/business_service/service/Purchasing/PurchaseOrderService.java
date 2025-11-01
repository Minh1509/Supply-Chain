package scms.business_service.service.Purchasing;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import scms.business_service.entity.Purchasing.PurchaseOrder;
import scms.business_service.event.publisher.ExternalServicePublisher;
import scms.business_service.model.dto.request.UpdateStatusRequest;
import scms.business_service.model.dto.response.external.CompanyDto;
import scms.business_service.model.dto.response.external.ItemDto;
import scms.business_service.entity.Purchasing.PurchaseOrderDetail;
import scms.business_service.entity.Sales.Quotation;
import scms.business_service.entity.Sales.QuotationDetail;
import scms.business_service.exception.RpcException;
import scms.business_service.model.dto.request.Purchasing.PurchaseOrderRequest;
import scms.business_service.model.dto.request.Purchasing.PurchaseReportRequest;
import scms.business_service.model.dto.response.Purchasing.MonthlySPReportDto;
import scms.business_service.model.dto.response.Purchasing.PurchaseOrderDetailDto;
import scms.business_service.model.dto.response.Purchasing.PurchaseOrderDto;
import scms.business_service.model.dto.response.Sales.ItemReportDto;
import scms.business_service.model.dto.response.external.WarehouseDto;
import scms.business_service.repository.Purchasing.PurchaseOrderDetailRepository;
import scms.business_service.repository.Purchasing.PurchaseOrderRepository;
import scms.business_service.repository.Sales.QuotationDetailRepository;
import scms.business_service.repository.Sales.QuotationRepository;

@Service
public class PurchaseOrderService {

  @Autowired
  private PurchaseOrderRepository purchaseOrderRepository;

  @Autowired
  private PurchaseOrderDetailRepository purchaseOrderDetailRepository;

  @Autowired
  private QuotationRepository quotationRepository;

  @Autowired
  private QuotationDetailRepository quotationDetailRepository;

  @Autowired
  private ExternalServicePublisher externalServicePublisher;

  public PurchaseOrderDto createPurchaseOrder(PurchaseOrderRequest request) {
    Quotation quotation = quotationRepository.findById(request.getQuotationId())
        .orElseThrow(() -> new RpcException(404, "Không tìm thấy báo giá!"));

    PurchaseOrder existingPo = purchaseOrderRepository.findByQuotationId(quotation.getId());
    if (existingPo != null) {
      throw new RpcException(400, "Đơn mua hàng cho báo giá này đã tồn tại!");
    }

    PurchaseOrder purchaseOrder = new PurchaseOrder();
    purchaseOrder.setCode(generatePurchaseOrderCode(request.getCompanyId(), request.getSupplierCompanyId()));
    purchaseOrder.setCompanyId(request.getCompanyId());
    purchaseOrder.setSupplierCompanyId(request.getSupplierCompanyId());
    purchaseOrder.setReceiveWarehouseId(request.getReceiveWarehouseId());
    purchaseOrder.setQuotation(quotation);
    purchaseOrder.setPaymentMethod(request.getPaymentMethod());
    purchaseOrder.setDeliveryToAddress(request.getDeliveryToAddress());
    purchaseOrder.setCreatedBy(request.getCreatedBy());
    purchaseOrder.setStatus(request.getStatus() != null ? request.getStatus() : "PENDING");
    purchaseOrder.setCreatedOn(LocalDateTime.now());
    purchaseOrder.setLastUpdatedOn(LocalDateTime.now());

    PurchaseOrder savedPurchaseOrder = purchaseOrderRepository.save(purchaseOrder);

    // Lấy quotation details và tạo purchase order details từ quotation
    List<QuotationDetail> quotationDetails = quotationDetailRepository.findByQuotationId(quotation.getId());
    for (QuotationDetail quotationDetail : quotationDetails) {
      PurchaseOrderDetail detail = new PurchaseOrderDetail();
      detail.setPurchaseOrder(savedPurchaseOrder);
      detail.setItemId(quotationDetail.getCustomerItemId()); // Item của công ty mua
      detail.setSupplierItemId(quotationDetail.getItemId()); // Item của công ty bán
      detail.setQuantity(quotationDetail.getQuantity());
      detail.setItemPrice(quotationDetail.getItemPrice());
      detail.setDiscount(quotationDetail.getDiscount());
      detail.setNote(quotationDetail.getNote());
      purchaseOrderDetailRepository.save(detail);
    }

    return getPurchaseOrderById(savedPurchaseOrder.getId());
  }

  public PurchaseOrderDto getPurchaseOrderById(Long id) {
    PurchaseOrder purchaseOrder = purchaseOrderRepository.findById(id)
        .orElseThrow(() -> new RpcException(404, "Không tìm thấy đơn mua hàng!"));

    List<PurchaseOrderDetail> details = purchaseOrderDetailRepository.findByPurchaseOrderId(purchaseOrder.getId());
    return convertToDto(purchaseOrder, details);
  }

  public PurchaseOrderDto getPurchaseOrderByCode(String poCode) {
    PurchaseOrder purchaseOrder = purchaseOrderRepository.findByCode(poCode);
    if (purchaseOrder == null) {
      throw new RpcException(404, "Không tìm thấy đơn mua hàng!");
    }
    PurchaseOrderDto dto = new PurchaseOrderDto();
    dto.setId(purchaseOrder.getId());

    List<PurchaseOrderDetail> details = purchaseOrderDetailRepository.findByPurchaseOrderId(purchaseOrder.getId());
    List<PurchaseOrderDetailDto> detailDtos = new ArrayList<>();
    details.stream().forEach(detail -> {
      PurchaseOrderDetailDto detailDto = new PurchaseOrderDetailDto();
      detailDto.setPurchaseOrderDetailId(detail.getId());
      detailDto.setItemId(detail.getItemId());
      detailDto.setQuantity(detail.getQuantity());
      detailDtos.add(detailDto);
    });
    dto.setPurchaseOrderDetails(detailDtos);
    return dto;
  }

  public PurchaseOrderDto getPurchaseOrderByQuotationId(Long quotationId) {
    PurchaseOrder purchaseOrder = purchaseOrderRepository.findByQuotationId(quotationId);
    if (purchaseOrder == null) {
      throw new RpcException(404, "Không tìm thấy đơn mua hàng cho báo giá này!");
    }

    List<PurchaseOrderDetail> details = purchaseOrderDetailRepository.findByPurchaseOrderId(purchaseOrder.getId());
    return convertToDto(purchaseOrder, details);
  }

  public List<PurchaseOrderDto> getAllPoByCompany(Long companyId) {
    List<PurchaseOrder> purchaseOrders = purchaseOrderRepository.findByCompanyId(companyId);
    return purchaseOrders.stream()
        .map(po -> {
          List<PurchaseOrderDetail> details = purchaseOrderDetailRepository.findByPurchaseOrderId(po.getId());
          return convertToDto(po, details);
        })
        .collect(Collectors.toList());
  }

  public List<PurchaseOrderDto> getAllPoBySupplierCompany(Long supplierCompanyId) {
    List<PurchaseOrder> purchaseOrders = purchaseOrderRepository.findBySupplierCompanyId(supplierCompanyId);
    return purchaseOrders.stream()
        .map(po -> {
          List<PurchaseOrderDetail> details = purchaseOrderDetailRepository.findByPurchaseOrderId(po.getId());
          return convertToDto(po, details);
        })
        .collect(Collectors.toList());
  }

  public PurchaseOrderDto updatePoStatus(Long id, UpdateStatusRequest body) {
    PurchaseOrder purchaseOrder = purchaseOrderRepository.findById(id)
        .orElseThrow(() -> new RpcException(404, "Không tìm thấy đơn mua hàng!"));

    if (purchaseOrder.getStatus().equals("Đã hoàn thành")) {
      throw new RpcException(400, "Không thể cập nhật đơn mua hàng đã hoàn thành");
    }

    if (purchaseOrder.getStatus().equals("Đã hủy")) {
      throw new RpcException(400, "Không thể cập nhật đơn mua hàng đã bị hủy");
    }

    purchaseOrder.setStatus(body.getStatus());
    purchaseOrder.setLastUpdatedOn(LocalDateTime.now());
    purchaseOrderRepository.save(purchaseOrder);

    List<PurchaseOrderDetail> details = purchaseOrderDetailRepository.findByPurchaseOrderId(purchaseOrder.getId());
    return convertToDto(purchaseOrder, details);
  }

  public List<ItemReportDto> getPurchaseReport(PurchaseReportRequest request, Long companyId) {
    LocalDateTime startDate = request.getStartDate();
    LocalDateTime endDate = request.getEndDate();

    List<PurchaseOrder> purchaseOrders = purchaseOrderRepository.findByCompanyIdAndStatusAndLastUpdatedOnBetween(
        companyId, "Đã hoàn thành", startDate, endDate);

    Map<Long, Double> itemQuantityMap = new HashMap<>();

    for (PurchaseOrder po : purchaseOrders) {
      List<PurchaseOrderDetail> details = purchaseOrderDetailRepository.findByPurchaseOrderId(po.getId());
      for (PurchaseOrderDetail detail : details) {
        Long itemId = detail.getItemId();
        Double quantity = detail.getQuantity() != null ? detail.getQuantity() : 0.0;
        itemQuantityMap.put(itemId, itemQuantityMap.getOrDefault(itemId, 0.0) + quantity);
      }
    }

    List<ItemReportDto> result = new ArrayList<>();
    for (Map.Entry<Long, Double> entry : itemQuantityMap.entrySet()) {
      ItemReportDto dto = new ItemReportDto();
      dto.setItemId(entry.getKey());
      dto.setTotalQuantity(entry.getValue());

      // Lấy thông tin item
      ItemDto item = externalServicePublisher.getItemById(entry.getKey());
      if (item != null) {
        dto.setItemCode(item.getItemCode());
        dto.setItemName(item.getItemName());
      }

      result.add(dto);
    }

    return result;
  }

  public List<MonthlySPReportDto> getMonthlyPurchaseReport(Long companyId) {
    String status = "Đã hoàn thành";

    // Lấy 12 tháng gần nhất
    LocalDateTime now = LocalDateTime.now();
    LocalDateTime startDate = now.minusMonths(11).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
    LocalDateTime endDate = now.withHour(23).withMinute(59).withSecond(59).withNano(999999999);

    List<PurchaseOrder> purchaseOrders = purchaseOrderRepository.findByCompanyIdAndStatusAndLastUpdatedOnBetween(
        companyId, status, startDate, endDate);

    Map<YearMonth, MonthlyAggregation> monthlyMap = new TreeMap<>();

    for (PurchaseOrder po : purchaseOrders) {
      YearMonth month = YearMonth.from(po.getLastUpdatedOn());

      MonthlyAggregation aggregation = monthlyMap.getOrDefault(month, new MonthlyAggregation());
      aggregation.totalOrder++;

      List<PurchaseOrderDetail> details = purchaseOrderDetailRepository.findByPurchaseOrderId(po.getId());
      for (PurchaseOrderDetail detail : details) {
        aggregation.totalQuantity += detail.getQuantity() != null ? detail.getQuantity() : 0.0;

        // Tính tổng tiền
        double totalPrice = detail.getQuantity() * detail.getItemPrice();
        double discount = detail.getDiscount() != null ? detail.getDiscount() : 0.0;
        aggregation.totalAmount += totalPrice - discount;
      }

      monthlyMap.put(month, aggregation);
    }

    // Tạo report cho 12 tháng gần nhất
    List<MonthlySPReportDto> result = new ArrayList<>();
    for (int i = 0; i < 12; i++) {
      YearMonth ym = YearMonth.from(startDate.plusMonths(i));
      MonthlyAggregation aggr = monthlyMap.getOrDefault(ym, new MonthlyAggregation());

      MonthlySPReportDto report = new MonthlySPReportDto();
      report.setMonth(ym.format(DateTimeFormatter.ofPattern("MM/yyyy")));
      report.setTotalOrder((double) aggr.totalOrder);
      report.setTotalQuantity((int) aggr.totalQuantity);
      report.setTotalAmount(aggr.totalAmount);

      result.add(report);
    }

    return result;
  }

  private String generatePurchaseOrderCode(Long companyId, Long supplierCompanyId) {
    String prefix = "PO" + companyId + supplierCompanyId;
    String year = String.valueOf(LocalDateTime.now().getYear()).substring(2);
    int count = purchaseOrderRepository.countByCodeStartingWith(prefix);
    return prefix + year + String.format("%04d", count + 1);
  }

  private PurchaseOrderDto convertToDto(PurchaseOrder purchaseOrder, List<PurchaseOrderDetail> details) {
    PurchaseOrderDto dto = new PurchaseOrderDto();
    dto.setId(purchaseOrder.getId());
    dto.setCode(purchaseOrder.getCode());
    dto.setCompanyId(purchaseOrder.getCompanyId());
    dto.setSupplierCompanyId(purchaseOrder.getSupplierCompanyId());
    dto.setReceiveWarehouseId(purchaseOrder.getReceiveWarehouseId());
    dto.setQuotationId(purchaseOrder.getQuotation().getId());
    dto.setQuotationCode(purchaseOrder.getQuotation().getCode());
    dto.setPaymentMethod(purchaseOrder.getPaymentMethod());
    dto.setDeliveryToAddress(purchaseOrder.getDeliveryToAddress());
    dto.setCreatedBy(purchaseOrder.getCreatedBy());
    dto.setStatus(purchaseOrder.getStatus());
    dto.setCreatedOn(purchaseOrder.getCreatedOn());
    dto.setLastUpdatedOn(purchaseOrder.getLastUpdatedOn());

    // Lấy thông tin company
    CompanyDto company = externalServicePublisher.getCompanyById(purchaseOrder.getCompanyId());
    if (company != null) {
      dto.setCompanyCode(company.getCompanyCode());
      dto.setCompanyName(company.getCompanyName());
    }

    CompanyDto supplier = externalServicePublisher.getCompanyById(purchaseOrder.getSupplierCompanyId());
    if (supplier != null) {
      dto.setSupplierCompanyCode(supplier.getCompanyCode());
      dto.setSupplierCompanyName(supplier.getCompanyName());
    }

    // Lâấy thông tin warehouse
    WarehouseDto warehouse = externalServicePublisher.getWarehouseById(purchaseOrder.getReceiveWarehouseId());
    if(warehouse != null) {
      dto.setReceiveWarehouseCode(warehouse.getWarehouseCode());
    }

    // Lấy thông tin từ quotation
    dto.setSubTotal(purchaseOrder.getQuotation().getSubTotal());
    dto.setTaxRate(purchaseOrder.getQuotation().getTaxRate());
    dto.setTaxAmount(purchaseOrder.getQuotation().getTaxAmount());
    dto.setTotalAmount(purchaseOrder.getQuotation().getTotalAmount());

    List<PurchaseOrderDetailDto> detailDtos = details.stream()
        .map(detail -> {
          PurchaseOrderDetailDto detailDto = new PurchaseOrderDetailDto();
          detailDto.setPurchaseOrderDetailId(detail.getId());
          detailDto.setId(purchaseOrder.getId());
          detailDto.setCode(purchaseOrder.getCode());
          detailDto.setItemId(detail.getItemId());
          detailDto.setSupplierItemId(detail.getSupplierItemId());
          detailDto.setQuantity(detail.getQuantity());
          detailDto.setItemPrice(detail.getItemPrice());
          detailDto.setDiscount(detail.getDiscount());
          detailDto.setNote(detail.getNote());

          // Lấy thông tin item
          ItemDto item = externalServicePublisher.getItemById(detail.getItemId());
          if (item != null) {
            detailDto.setItemCode(item.getItemCode());
            detailDto.setItemName(item.getItemName());
          }

          ItemDto supplierItem = externalServicePublisher.getItemById(detail.getSupplierItemId());
          if (supplierItem != null) {
            detailDto.setSupplierItemCode(supplierItem.getItemCode());
            detailDto.setSupplierItemName(supplierItem.getItemName());
          }

          return detailDto;
        })
        .collect(Collectors.toList());

    dto.setPurchaseOrderDetails(detailDtos);
    return dto;
  }

  private static class MonthlyAggregation {
    int totalOrder = 0;
    double totalQuantity = 0.0;
    double totalAmount = 0.0;
  }
}
