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
import scms.business_service.entity.Purchasing.PurchaseOrderDetail;
import scms.business_service.entity.Sales.Quotation;
import scms.business_service.exception.RpcException;
import scms.business_service.model.dto.request.Purchasing.PurchaseOrderDetailRequest;
import scms.business_service.model.dto.request.Purchasing.PurchaseOrderRequest;
import scms.business_service.model.dto.request.Purchasing.PurchaseReportRequest;
import scms.business_service.model.dto.response.Purchasing.MonthlySPReportDto;
import scms.business_service.model.dto.response.Purchasing.PurchaseOrderDetailDto;
import scms.business_service.model.dto.response.Purchasing.PurchaseOrderDto;
import scms.business_service.model.dto.response.Sales.ItemReportDto;
import scms.business_service.repository.Purchasing.PurchaseOrderDetailRepository;
import scms.business_service.repository.Purchasing.PurchaseOrderRepository;
import scms.business_service.repository.Sales.QuotationRepository;

@Service
public class PurchaseOrderService {

  @Autowired
  private PurchaseOrderRepository purchaseOrderRepository;

  @Autowired
  private PurchaseOrderDetailRepository purchaseOrderDetailRepository;

  @Autowired
  private QuotationRepository quotationRepository;

  public PurchaseOrderDto createPurchaseOrder(PurchaseOrderRequest request) {
    Quotation quotation = quotationRepository.findById(request.getQuotationId())
        .orElseThrow(() -> new RpcException(404, "Không tìm thấy báo giá!"));

    PurchaseOrder existingPo = purchaseOrderRepository.findByQuotationId(quotation.getId());
    if (existingPo != null) {
      throw new RpcException(400, "Đơn mua hàng cho báo giá này đã tồn tại!");
    }

    PurchaseOrder purchaseOrder = new PurchaseOrder();
    purchaseOrder.setCode(generatePurchaseOrderCode(request.getCompanyId()));
    purchaseOrder.setCompanyId(request.getCompanyId());
    purchaseOrder.setSupplierCompanyId(request.getSupplierCompanyId());
    purchaseOrder.setReceiveWarehouseId(request.getReceiveWarehouseId());
    purchaseOrder.setQuotation(quotation);
    purchaseOrder.setStatus(request.getStatus() != null ? request.getStatus() : "PENDING");
    purchaseOrder.setCreatedOn(LocalDateTime.now());
    purchaseOrder.setLastUpdatedOn(LocalDateTime.now());

    PurchaseOrder savedPurchaseOrder = purchaseOrderRepository.save(purchaseOrder);

    if (request.getDetails() != null && !request.getDetails().isEmpty()) {
      List<PurchaseOrderDetail> details = new ArrayList<>();
      for (PurchaseOrderDetailRequest detailReq : request.getDetails()) {
        PurchaseOrderDetail detail = new PurchaseOrderDetail();
        detail.setPurchaseOrder(savedPurchaseOrder);
        detail.setItemId(detailReq.getItemId());
        detail.setSupplierItemId(detailReq.getSupplierItemId());
        detail.setQuantity(detailReq.getQuantity());
        detail.setItemPrice(detailReq.getItemPrice());
        detail.setDiscount(detailReq.getDiscount());
        details.add(detail);
      }
      purchaseOrderDetailRepository.saveAll(details);
    }

    return getPurchaseOrderById(savedPurchaseOrder.getId());
  }

  public PurchaseOrderDto getPurchaseOrderById(Long id) {
    PurchaseOrder purchaseOrder = purchaseOrderRepository.findById(id)
        .orElseThrow(() -> new RpcException(404, "Không tìm thấy đơn mua hàng!"));

    List<PurchaseOrderDetail> details = purchaseOrderDetailRepository.findByPurchaseOrderId(purchaseOrder.getId());
    return convertToDto(purchaseOrder, details);
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

  public PurchaseOrderDto updatePoStatus(Long id, String status) {
    PurchaseOrder purchaseOrder = purchaseOrderRepository.findById(id)
        .orElseThrow(() -> new RpcException(404, "Không tìm thấy đơn mua hàng!"));

    if (purchaseOrder.getStatus().equals("COMPLETED")) {
      throw new RpcException(400, "Không thể cập nhật đơn mua hàng đã hoàn thành");
    }

    if (purchaseOrder.getStatus().equals("CANCELLED")) {
      throw new RpcException(400, "Không thể cập nhật đơn mua hàng đã bị hủy");
    }

    purchaseOrder.setStatus(status);
    purchaseOrder.setLastUpdatedOn(LocalDateTime.now());
    purchaseOrderRepository.save(purchaseOrder);

    List<PurchaseOrderDetail> details = purchaseOrderDetailRepository.findByPurchaseOrderId(purchaseOrder.getId());
    return convertToDto(purchaseOrder, details);
  }

  public List<ItemReportDto> getPurchaseReport(PurchaseReportRequest request) {
    LocalDateTime startDate = request.getStartDate().atStartOfDay();
    LocalDateTime endDate = request.getEndDate().atTime(23, 59, 59);

    List<PurchaseOrder> purchaseOrders = purchaseOrderRepository.findByCompanyIdAndStatusAndLastUpdatedOnBetween(
        request.getCompanyId(),
        request.getStatus(),
        startDate,
        endDate);

    Map<Long, ItemReportDto> itemReportMap = new HashMap<>();

    for (PurchaseOrder po : purchaseOrders) {
      List<PurchaseOrderDetail> details = purchaseOrderDetailRepository.findByPurchaseOrderId(po.getId());

      for (PurchaseOrderDetail detail : details) {
        Long itemId = detail.getItemId();
        ItemReportDto reportDto = itemReportMap.getOrDefault(itemId, new ItemReportDto());

        reportDto.setItemId(itemId);
        reportDto.setTotalQuantity(reportDto.getTotalQuantity() + detail.getQuantity());

        double totalPrice = detail.getQuantity() * detail.getItemPrice();
        double discount = detail.getDiscount() != null ? detail.getDiscount() : 0.0;
        reportDto.setTotalRevenue(reportDto.getTotalRevenue() + totalPrice - discount);

        itemReportMap.put(itemId, reportDto);
      }
    }

    return new ArrayList<>(itemReportMap.values());
  }

  public List<MonthlySPReportDto> getMonthlyPurchaseReport(Long companyId, String status, int year) {
    LocalDateTime startDate = LocalDateTime.of(year, 1, 1, 0, 0);
    LocalDateTime endDate = LocalDateTime.of(year, 12, 31, 23, 59, 59);

    List<PurchaseOrder> purchaseOrders = purchaseOrderRepository.findByCompanyIdAndStatusAndLastUpdatedOnBetween(
        companyId, status, startDate, endDate);

    Map<String, MonthlyAggregation> monthlyMap = new TreeMap<>();
    DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("yyyy-MM");

    for (PurchaseOrder po : purchaseOrders) {
      String monthKey = po.getLastUpdatedOn().format(monthFormatter);
      MonthlyAggregation aggregation = monthlyMap.getOrDefault(monthKey, new MonthlyAggregation());
      aggregation.count++;

      List<PurchaseOrderDetail> details = purchaseOrderDetailRepository.findByPurchaseOrderId(po.getId());
      for (PurchaseOrderDetail detail : details) {
        double totalPrice = detail.getQuantity() * detail.getItemPrice();
        double discount = detail.getDiscount() != null ? detail.getDiscount() : 0.0;
        aggregation.totalAmount += totalPrice - discount;
      }

      monthlyMap.put(monthKey, aggregation);
    }

    List<MonthlySPReportDto> reports = new ArrayList<>();
    for (int month = 1; month <= 12; month++) {
      YearMonth yearMonth = YearMonth.of(year, month);
      String monthKey = yearMonth.format(monthFormatter);

      MonthlyAggregation aggregation = monthlyMap.getOrDefault(monthKey, new MonthlyAggregation());

      MonthlySPReportDto report = new MonthlySPReportDto();
      report.setMonth(monthKey);
      report.setCount(aggregation.count);
      report.setTotalAmount(aggregation.totalAmount);

      reports.add(report);
    }

    return reports;
  }

  private String generatePurchaseOrderCode(Long companyId) {
    String prefix = "PO" + companyId;
    String year = String.valueOf(LocalDateTime.now().getYear()).substring(2);
    int count = purchaseOrderRepository.countByCodeStartingWith(prefix);
    return prefix + year + String.format("%04d", count + 1);
  }

  private PurchaseOrderDto convertToDto(PurchaseOrder purchaseOrder, List<PurchaseOrderDetail> details) {
    PurchaseOrderDto dto = new PurchaseOrderDto();
    dto.setPoId(purchaseOrder.getId());
    dto.setPoCode(purchaseOrder.getCode());
    dto.setCompanyId(purchaseOrder.getCompanyId());
    dto.setSupplierCompanyId(purchaseOrder.getSupplierCompanyId());
    dto.setReceiveWarehouseId(purchaseOrder.getReceiveWarehouseId());
    dto.setQuotationId(purchaseOrder.getQuotation().getId());
    dto.setQuotationCode(purchaseOrder.getQuotation().getCode());
    dto.setStatus(purchaseOrder.getStatus());
    dto.setCreatedOn(purchaseOrder.getCreatedOn());
    dto.setLastUpdatedOn(purchaseOrder.getLastUpdatedOn());

    List<PurchaseOrderDetailDto> detailDtos = details.stream()
        .map(detail -> {
          PurchaseOrderDetailDto detailDto = new PurchaseOrderDetailDto();
          detailDto.setPurchaseOrderDetailId(detail.getId());
          detailDto.setPoId(purchaseOrder.getId());
          detailDto.setItemId(detail.getItemId());
          detailDto.setSupplierItemId(detail.getSupplierItemId());
          detailDto.setQuantity(detail.getQuantity());
          detailDto.setItemPrice(detail.getItemPrice());
          detailDto.setDiscount(detail.getDiscount());
          return detailDto;
        })
        .collect(Collectors.toList());

    dto.setPurchaseOrderDetails(detailDtos);
    return dto;
  }

  private static class MonthlyAggregation {
    int count = 0;
    double totalAmount = 0.0;
  }
}
