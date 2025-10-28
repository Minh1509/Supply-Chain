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
import scms.business_service.entity.Sales.SalesOrder;
import scms.business_service.entity.Sales.SalesOrderDetail;
import scms.business_service.exception.RpcException;
import scms.business_service.model.dto.request.Sales.SalesOrderDetailRequest;
import scms.business_service.model.dto.request.Sales.SalesOrderRequest;
import scms.business_service.model.dto.request.Sales.SalesReportRequest;
import scms.business_service.model.dto.response.Purchasing.MonthlySPReportDto;
import scms.business_service.model.dto.response.Sales.ItemReportDto;
import scms.business_service.model.dto.response.Sales.SalesOrderDetailDto;
import scms.business_service.model.dto.response.Sales.SalesOrderDto;
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

  public SalesOrderDto createSalesOrder(SalesOrderRequest request) {
    PurchaseOrder purchaseOrder = purchaseOrderRepository.findById(request.getPoId())
        .orElseThrow(() -> new RpcException(404, "Không tìm thấy đơn mua hàng!"));

    SalesOrder existingSo = salesOrderRepository.findByPurchaseOrderId(purchaseOrder.getId());
    if (existingSo != null) {
      throw new RpcException(400, "Đơn bán hàng cho đơn mua hàng này đã tồn tại!");
    }

    SalesOrder salesOrder = new SalesOrder();
    salesOrder.setCode(generateSalesOrderCode(request.getCompanyId()));
    salesOrder.setCompanyId(request.getCompanyId());
    salesOrder.setCustomerCompanyId(request.getCustomerCompanyId());
    salesOrder.setPurchaseOrder(purchaseOrder);
    salesOrder.setPaymentMethod(request.getPaymentMethod());
    salesOrder.setStatus(request.getStatus() != null ? request.getStatus() : "PENDING");
    salesOrder.setCreatedOn(LocalDateTime.now());
    salesOrder.setLastUpdatedOn(LocalDateTime.now());

    SalesOrder savedSalesOrder = salesOrderRepository.save(salesOrder);

    if (request.getDetails() != null && !request.getDetails().isEmpty()) {
      List<SalesOrderDetail> details = new ArrayList<>();
      for (SalesOrderDetailRequest detailReq : request.getDetails()) {
        SalesOrderDetail detail = new SalesOrderDetail();
        detail.setSalesOrder(savedSalesOrder);
        detail.setItemId(detailReq.getItemId());
        detail.setCustomerItemId(detailReq.getCustomerItemId());
        detail.setQuantity(detailReq.getQuantity());
        detail.setItemPrice(detailReq.getItemPrice());
        detail.setDiscount(detailReq.getDiscount());
        details.add(detail);
      }
      salesOrderDetailRepository.saveAll(details);
    }

    return getSalesOrderById(savedSalesOrder.getId());
  }

  public SalesOrderDto getSalesOrderById(Long id) {
    SalesOrder salesOrder = salesOrderRepository.findById(id)
        .orElseThrow(() -> new RpcException(404, "Không tìm thấy đơn bán hàng!"));

    List<SalesOrderDetail> details = salesOrderDetailRepository.findBySalesOrderId(salesOrder.getId());
    return convertToDto(salesOrder, details);
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

  public SalesOrderDto updateSoStatus(Long id, String status) {
    SalesOrder salesOrder = salesOrderRepository.findById(id)
        .orElseThrow(() -> new RpcException(404, "Không tìm thấy đơn bán hàng!"));

    salesOrder.setStatus(status);
    salesOrder.setLastUpdatedOn(LocalDateTime.now());
    salesOrderRepository.save(salesOrder);

    List<SalesOrderDetail> details = salesOrderDetailRepository.findBySalesOrderId(salesOrder.getId());
    return convertToDto(salesOrder, details);
  }

  public List<ItemReportDto> getSalesReport(SalesReportRequest request) {
    LocalDateTime startDate = request.getStartDate().atStartOfDay();
    LocalDateTime endDate = request.getEndDate().atTime(23, 59, 59);

    List<SalesOrder> salesOrders = salesOrderRepository.findByCompanyIdAndStatusAndLastUpdatedOnBetween(
        request.getCompanyId(),
        request.getStatus(),
        startDate,
        endDate);

    Map<Long, ItemReportDto> itemReportMap = new HashMap<>();

    for (SalesOrder so : salesOrders) {
      List<SalesOrderDetail> details = salesOrderDetailRepository.findBySalesOrderId(so.getId());

      for (SalesOrderDetail detail : details) {
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

  public List<MonthlySPReportDto> getMonthlySalesReport(Long companyId, String status, int year) {
    LocalDateTime startDate = LocalDateTime.of(year, 1, 1, 0, 0);
    LocalDateTime endDate = LocalDateTime.of(year, 12, 31, 23, 59, 59);

    List<SalesOrder> salesOrders = salesOrderRepository.findByCompanyIdAndStatusAndLastUpdatedOnBetween(
        companyId, status, startDate, endDate);

    Map<String, MonthlyAggregation> monthlyMap = new TreeMap<>();
    DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("yyyy-MM");

    for (SalesOrder so : salesOrders) {
      String monthKey = so.getLastUpdatedOn().format(monthFormatter);
      MonthlyAggregation aggregation = monthlyMap.getOrDefault(monthKey, new MonthlyAggregation());
      aggregation.count++;

      List<SalesOrderDetail> details = salesOrderDetailRepository.findBySalesOrderId(so.getId());
      for (SalesOrderDetail detail : details) {
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

  private String generateSalesOrderCode(Long companyId) {
    String prefix = "SO" + companyId;
    String year = String.valueOf(LocalDateTime.now().getYear()).substring(2);
    int count = salesOrderRepository.countByCodeStartingWith(prefix);
    return prefix + year + String.format("%04d", count + 1);
  }

  private SalesOrderDto convertToDto(SalesOrder salesOrder, List<SalesOrderDetail> details) {
    SalesOrderDto dto = new SalesOrderDto();
    dto.setSoId(salesOrder.getId());
    dto.setSoCode(salesOrder.getCode());
    dto.setCompanyId(salesOrder.getCompanyId());
    dto.setCustomerCompanyId(salesOrder.getCustomerCompanyId());
    dto.setPoId(salesOrder.getPurchaseOrder().getId());
    dto.setPoCode(salesOrder.getPurchaseOrder().getCode());
    dto.setPaymentMethod(salesOrder.getPaymentMethod());
    dto.setStatus(salesOrder.getStatus());
    dto.setCreatedOn(salesOrder.getCreatedOn());
    dto.setLastUpdatedOn(salesOrder.getLastUpdatedOn());

    List<SalesOrderDetailDto> detailDtos = details.stream()
        .map(detail -> {
          SalesOrderDetailDto detailDto = new SalesOrderDetailDto();
          detailDto.setSoDetailId(detail.getId());
          detailDto.setSoId(salesOrder.getId());
          detailDto.setItemId(detail.getItemId());
          detailDto.setCustomerItemId(detail.getCustomerItemId());
          detailDto.setQuantity(detail.getQuantity());
          detailDto.setItemPrice(detail.getItemPrice());
          detailDto.setDiscount(detail.getDiscount());
          return detailDto;
        })
        .collect(Collectors.toList());

    dto.setSalesOrderDetails(detailDtos);
    return dto;
  }

  private static class MonthlyAggregation {
    int count = 0;
    double totalAmount = 0.0;
  }
}
