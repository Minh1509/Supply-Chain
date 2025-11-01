package scms.business_service.service.Sales;

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
import scms.business_service.entity.Sales.SalesOrder;
import scms.business_service.entity.Sales.SalesOrderDetail;
import scms.business_service.exception.RpcException;
import scms.business_service.model.dto.request.Sales.SalesOrderRequest;
import scms.business_service.model.dto.request.Sales.SalesReportRequest;
import scms.business_service.model.dto.response.Purchasing.MonthlySPReportDto;
import scms.business_service.model.dto.response.Sales.ItemReportDto;
import scms.business_service.model.dto.response.Sales.SalesOrderDetailDto;
import scms.business_service.model.dto.response.Sales.SalesOrderDto;
import scms.business_service.repository.Purchasing.PurchaseOrderDetailRepository;
import scms.business_service.repository.Purchasing.PurchaseOrderRepository;
import scms.business_service.repository.Sales.SalesOrderDetailRepository;
import scms.business_service.repository.Sales.SalesOrderRepository;

@Service
public class SalesOrderService {

  @Autowired
  private SalesOrderRepository salesOrderRepository;

  @Autowired
  private SalesOrderDetailRepository salesOrderDetailRepository;

  @Autowired
  private PurchaseOrderRepository purchaseOrderRepository;

  @Autowired
  private PurchaseOrderDetailRepository purchaseOrderDetailRepository;

  @Autowired
  private ExternalServicePublisher externalServicePublisher;

  public SalesOrderDto createSalesOrder(SalesOrderRequest request) {
    PurchaseOrder purchaseOrder = purchaseOrderRepository.findById(request.getPoId())
        .orElseThrow(() -> new RpcException(404, "Không tìm thấy đơn mua hàng!"));

    SalesOrder existingSo = salesOrderRepository.findByPurchaseOrderId(purchaseOrder.getId());
    if (existingSo != null) {
      throw new RpcException(400, "Đơn bán hàng cho đơn mua hàng này đã tồn tại!");
    }

    SalesOrder salesOrder = new SalesOrder();
    salesOrder.setCode(generateSalesOrderCode(request.getPoId()));
    salesOrder.setCompanyId(request.getCompanyId());
    salesOrder.setCustomerCompanyId(request.getCustomerCompanyId());
    salesOrder.setPurchaseOrder(purchaseOrder);
    salesOrder.setPaymentMethod(request.getPaymentMethod());
    salesOrder.setDeliveryFromAddress(request.getDeliveryFromAddress());
    salesOrder.setDeliveryToAddress(request.getDeliveryToAddress());
    salesOrder.setCreatedBy(request.getCreatedBy());
    salesOrder.setStatus(request.getStatus() != null ? request.getStatus() : "PENDING");
    salesOrder.setCreatedOn(LocalDateTime.now());
    salesOrder.setLastUpdatedOn(LocalDateTime.now());

    SalesOrder savedSalesOrder = salesOrderRepository.save(salesOrder);
    
    // Lấy purchase order details và tạo sales order details
    List<PurchaseOrderDetail> purchaseOrderDetails = purchaseOrderDetailRepository.findByPurchaseOrderId(purchaseOrder.getId());
    for (PurchaseOrderDetail purchaseOrderDetail : purchaseOrderDetails) {
      SalesOrderDetail detail = new SalesOrderDetail();
      detail.setSalesOrder(savedSalesOrder);
      detail.setItemId(purchaseOrderDetail.getSupplierItemId()); // Item của supplier (người bán)
      detail.setCustomerItemId(purchaseOrderDetail.getItemId()); // Item của customer (người mua)
      detail.setQuantity(purchaseOrderDetail.getQuantity());
      detail.setItemPrice(purchaseOrderDetail.getItemPrice());
      detail.setDiscount(purchaseOrderDetail.getDiscount());
      detail.setNote(purchaseOrderDetail.getNote());
      salesOrderDetailRepository.save(detail);
    }

    return getSalesOrderById(savedSalesOrder.getId());
  }

  public SalesOrderDto getSalesOrderById(Long id) {
    SalesOrder salesOrder = salesOrderRepository.findById(id)
        .orElseThrow(() -> new RpcException(404, "Không tìm thấy đơn bán hàng!"));

    List<SalesOrderDetail> details = salesOrderDetailRepository.findBySalesOrderId(salesOrder.getId());
    return convertToDto(salesOrder, details);
  }

  public SalesOrderDto getSalesOrderByCode(String code) {
    SalesOrder salesOrder = salesOrderRepository.findByCode(code);
    if (salesOrder == null) {
      throw new RpcException(404, "Không tìm thấy đơn bán hàng!");
    }
    SalesOrderDto salesOrderDto = new SalesOrderDto();
    salesOrderDto.setId(salesOrder.getId());

    List<SalesOrderDetail> details = salesOrderDetailRepository.findBySalesOrderId(salesOrder.getId());
    List<SalesOrderDetailDto> detailDtos = new ArrayList<>();
     details.stream().forEach(detail -> {
      SalesOrderDetailDto detailDto = new SalesOrderDetailDto();
      detailDto.setId(detail.getId());
      detailDto.setItemId(detail.getItemId());
      detailDto.setQuantity(detail.getQuantity());
      detailDtos.add(detailDto);
    });
    salesOrderDto.setSalesOrderDetails(detailDtos);
    return salesOrderDto;
  }

  public SalesOrderDto getSalesOrderByPoId(Long poId) {
    SalesOrder salesOrder = salesOrderRepository.findByPurchaseOrderId(poId);
    if (salesOrder == null) {
      throw new RpcException(404, "Không tìm thấy đơn bán hàng cho đơn mua hàng này!");
    }

    List<SalesOrderDetail> details = salesOrderDetailRepository.findBySalesOrderId(salesOrder.getId());
    return convertToDto(salesOrder, details);
  }

  public List<SalesOrderDto> getAllSalesOrdersByCompany(Long companyId) {
    List<SalesOrder> salesOrders = salesOrderRepository.findByCompanyId(companyId);
    return salesOrders.stream()
        .map(so -> {
          List<SalesOrderDetail> details = salesOrderDetailRepository.findBySalesOrderId(so.getId());
          return convertToDto(so, details);
        })
        .collect(Collectors.toList());
  }

  public SalesOrderDto updateSoStatus(Long id, UpdateStatusRequest body) {
    SalesOrder salesOrder = salesOrderRepository.findById(id)
        .orElseThrow(() -> new RpcException(404, "Không tìm thấy đơn bán hàng!"));

    if (salesOrder.getStatus().equals("Đã hoàn thành")) {
      throw new RpcException(400, "Không thể cập nhật đơn bán hàng đã hoàn thành!");
    }
    
    if (salesOrder.getStatus().equals("Đã hủy")) {
      throw new RpcException(400, "Không thể cập nhật đơn bán hàng đã bị hủy!");
    }

    salesOrder.setStatus(body.getStatus());
    salesOrder.setLastUpdatedOn(LocalDateTime.now());
    salesOrderRepository.save(salesOrder);

    List<SalesOrderDetail> details = salesOrderDetailRepository.findBySalesOrderId(salesOrder.getId());
    return convertToDto(salesOrder, details);
  }

  public List<ItemReportDto> getSalesReport(SalesReportRequest request, Long companyId) {
    List<SalesOrder> salesOrders = salesOrderRepository.findByCompanyIdAndStatusAndLastUpdatedOnBetween(
        companyId, "Đã hoàn thành", request.getStartDate(), request.getEndDate());

    Map<Long, Double> itemQuantityMap = new HashMap<>();

    for (SalesOrder so : salesOrders) {
      List<SalesOrderDetail> details = salesOrderDetailRepository.findBySalesOrderId(so.getId());
      for (SalesOrderDetail detail : details) {
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

  public List<MonthlySPReportDto> getMonthlySalesReport(Long companyId) {
    LocalDateTime now = LocalDateTime.now();
    LocalDateTime oneYearAgo = now.minusMonths(11).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0)
        .withNano(0);

    List<SalesOrder> sos = salesOrderRepository
        .findByCompanyIdAndStatusAndLastUpdatedOnBetween(
            companyId, "Đã hoàn thành", oneYearAgo, now);

    Map<YearMonth, MonthlyAggregation> monthlyMap = new TreeMap<>();

    for (SalesOrder so : sos) {
      YearMonth month = YearMonth.from(so.getLastUpdatedOn());

      MonthlyAggregation aggregation = monthlyMap.getOrDefault(month, new MonthlyAggregation());
      aggregation.totalOrder++;

      aggregation.totalAmount += so.getPurchaseOrder().getQuotation().getTotalAmount() != null 
          ? so.getPurchaseOrder().getQuotation().getTotalAmount() : 0.0;

      List<SalesOrderDetail> details = salesOrderDetailRepository.findBySalesOrderId(so.getId());
      for (SalesOrderDetail detail : details) {
        aggregation.totalQuantity += detail.getQuantity() != null ? detail.getQuantity() : 0.0;
      }

      monthlyMap.put(month, aggregation);
    }

    List<MonthlySPReportDto> result = new ArrayList<>();
    for (int i = 0; i < 12; i++) {
      YearMonth ym = YearMonth.from(oneYearAgo.plusMonths(i));
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

  private String generateSalesOrderCode(Long poId) {
    String prefix = "SO" + String.valueOf(poId).substring(1);
    String year = String.valueOf(LocalDateTime.now().getYear()).substring(2);
    int count = salesOrderRepository.countByCodeStartingWith(prefix);
    return prefix + year + String.format("%04d", count + 1);
  }

  private SalesOrderDto convertToDto(SalesOrder salesOrder, List<SalesOrderDetail> details) {
    SalesOrderDto dto = new SalesOrderDto();
    dto.setId(salesOrder.getId());
    dto.setCode(salesOrder.getCode());
    dto.setCompanyId(salesOrder.getCompanyId());
    dto.setCustomerCompanyId(salesOrder.getCustomerCompanyId());
    dto.setPoId(salesOrder.getPurchaseOrder().getId());
    dto.setPoCode(salesOrder.getPurchaseOrder().getCode());
    dto.setPaymentMethod(salesOrder.getPaymentMethod());
    dto.setDeliveryFromAddress(salesOrder.getDeliveryFromAddress());
    dto.setDeliveryToAddress(salesOrder.getDeliveryToAddress());
    dto.setCreatedBy(salesOrder.getCreatedBy());
    dto.setStatus(salesOrder.getStatus());
    dto.setCreatedOn(salesOrder.getCreatedOn());
    dto.setLastUpdatedOn(salesOrder.getLastUpdatedOn());
    
    // Lấy thông tin company
    CompanyDto company = externalServicePublisher.getCompanyById(salesOrder.getCompanyId());
    if (company != null) {
      dto.setCompanyCode(company.getCompanyCode());
      dto.setCompanyName(company.getCompanyName());
    }
    
    CompanyDto customer = externalServicePublisher.getCompanyById(salesOrder.getCustomerCompanyId());
    if (customer != null) {
      dto.setCustomerCompanyCode(customer.getCompanyCode());
      dto.setCustomerCompanyName(customer.getCompanyName());
    }
    
    // Lấy thông tin tài chính từ quotation
    if (salesOrder.getPurchaseOrder() != null && salesOrder.getPurchaseOrder().getQuotation() != null) {
      dto.setSubTotal(salesOrder.getPurchaseOrder().getQuotation().getSubTotal());
      dto.setTaxRate(salesOrder.getPurchaseOrder().getQuotation().getTaxRate());
      dto.setTaxAmount(salesOrder.getPurchaseOrder().getQuotation().getTaxAmount());
      dto.setTotalAmount(salesOrder.getPurchaseOrder().getQuotation().getTotalAmount());
    }

    List<SalesOrderDetailDto> detailDtos = details.stream()
        .map(detail -> {
          SalesOrderDetailDto detailDto = new SalesOrderDetailDto();
          detailDto.setId(detail.getId());
          detailDto.setSoId(salesOrder.getId());
          detailDto.setItemId(detail.getItemId());
          detailDto.setCustomerItemId(detail.getCustomerItemId());
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
          
          ItemDto customerItem = externalServicePublisher.getItemById(detail.getCustomerItemId());
          if (customerItem != null) {
            detailDto.setCustomerItemCode(customerItem.getItemCode());
            detailDto.setCustomerItemName(customerItem.getItemName());
          }
          
          return detailDto;
        })
        .collect(Collectors.toList());

    dto.setSalesOrderDetails(detailDtos);
    return dto;
  }

  private static class MonthlyAggregation {
    int totalOrder = 0;
    double totalQuantity = 0.0;
    double totalAmount = 0.0;
  }
}
