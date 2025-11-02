package scms_be.inventory_service.service;

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

import scms_be.inventory_service.event.publisher.EventPublisher;
import scms_be.inventory_service.exception.RpcException;
import scms_be.inventory_service.model.dto.IssueTicketDetailDto;
import scms_be.inventory_service.model.dto.IssueTicketDto;
import scms_be.inventory_service.model.dto.ItemReportDto;
import scms_be.inventory_service.model.dto.MonthlyInventoryReportDto;
import scms_be.inventory_service.model.dto.publisher.BOMDetailDto;
import scms_be.inventory_service.model.dto.publisher.BOMDto;
import scms_be.inventory_service.model.dto.publisher.ItemDto;
import scms_be.inventory_service.model.dto.publisher.ManufactureOrderDto;
import scms_be.inventory_service.model.dto.publisher.SalesOrderDetailDto;
import scms_be.inventory_service.model.dto.publisher.SalesOrderDto;
import scms_be.inventory_service.model.entity.IssueTicket;
import scms_be.inventory_service.model.entity.IssueTicketDetail;
import scms_be.inventory_service.model.entity.TransferTicket;
import scms_be.inventory_service.model.entity.TransferTicketDetail;
import scms_be.inventory_service.model.entity.Warehouse;
import scms_be.inventory_service.model.request.IssueReportRequest;
import scms_be.inventory_service.model.request.IssueTicketRequest.IssueTicketData;
import scms_be.inventory_service.repository.IssueTicketDetailRepository;
import scms_be.inventory_service.repository.IssueTicketRepository;
import scms_be.inventory_service.repository.TransferTicketRepository;
import scms_be.inventory_service.repository.WarehouseRepository;


@Service
public class IssueTicketService {
  @Autowired
  private IssueTicketRepository issueTicketRepository;

  @Autowired
  private IssueTicketDetailRepository detailRepository;

  @Autowired
  private WarehouseRepository warehouseRepository;

  @Autowired
  private TransferTicketRepository transferTicketRepository;

  @Autowired
  private EventPublisher eventPublisher;

  public IssueTicketDto createIssueTicket(IssueTicketData request) {
    Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
        .orElseThrow(() -> new RpcException(400, "Không tìm thấy kho!"));

    IssueTicket ticket = new IssueTicket();
    ticket.setCompanyId(request.getCompanyId());
    ticket.setWarehouse(warehouse);
    ticket.setTicketCode(generateTicketCode(request.getCompanyId()));
    ticket.setIssueDate(request.getIssueDate());
    ticket.setReason(request.getReason());
    ticket.setIssueType(request.getIssueType());

    List<IssueTicketDetail> details = new ArrayList<>();

    if (request.getIssueType().equals("Sản xuất")) {
      ManufactureOrderDto manufactureOrder = eventPublisher.getManufactureOrderByCode(request.getReferenceCode());
      if (manufactureOrder == null) {
        throw new RpcException(404, "Không tìm thấy công lệnh sản xuất!");
      }
      ticket.setReferenceId(manufactureOrder.getMoId());

      BOMDto bom = eventPublisher.getBOMByItemId(manufactureOrder.getItemId());
      List<BOMDetailDto> bomDetails = bom.getBomDetails();
      for (BOMDetailDto bomDetail : bomDetails) {
        IssueTicketDetail detail = new IssueTicketDetail();
        detail.setTicket(ticket);
        ItemDto item = eventPublisher.getItemById(bomDetail.getItemId());
        if(item == null) {
          throw new RpcException(404, "Không tìm thấy hàng hóa!");
        }
        detail.setItemId(item.getItemId());
        detail.setQuantity(bomDetail.getQuantity() * manufactureOrder.getQuantity());
        detail.setNote(bomDetail.getNote());
        details.add(detail);
      }

    } else if (request.getIssueType().equals("Bán hàng")) {
      SalesOrderDto salesOrder = eventPublisher.getSalesOrderByCode(request.getReferenceCode());
      if (salesOrder == null) {
        throw new RpcException(404, "Không tim thấy đơn bán hàng!");
      }
      ticket.setReferenceId(salesOrder.getSoId());
      List<SalesOrderDetailDto> salesOrderDetails = salesOrder.getSalesOrderDetails();
      for (SalesOrderDetailDto salesOrderDetail : salesOrderDetails) {
        IssueTicketDetail detail = new IssueTicketDetail();
        detail.setTicket(ticket);
        ItemDto item = eventPublisher.getItemById(salesOrderDetail.getItemId());
        if(item == null) {
          throw new RpcException(404, "Không tìm thấy hàng hóa!");
        }
        detail.setItemId(item.getItemId());
        detail.setQuantity(salesOrderDetail.getQuantity());
        detail.setNote(salesOrderDetail.getNote());
        details.add(detail);
      }

    } else if (request.getIssueType().equals("Chuyển kho")) {
      TransferTicket transferTicket = transferTicketRepository.findByTicketCodeWithDetails(request.getReferenceCode());
      if (transferTicket == null) {
        throw new RpcException(404, "Không tìm thấy đơn chuyển kho!");
      }
      ticket.setReferenceId(transferTicket.getTicketId());
      List<TransferTicketDetail> transferTicketDetails = transferTicket.getTransferTicketDetails();
      for (TransferTicketDetail transferTicketDetail : transferTicketDetails) {
        IssueTicketDetail detail = new IssueTicketDetail();
        detail.setTicket(ticket);
        ItemDto item = eventPublisher.getItemById(transferTicketDetail.getItemId());
        if(item == null) {
          throw new RpcException(404, "Không tìm thấy hàng hóa!");
        }
        detail.setItemId(item.getItemId());
        detail.setQuantity(transferTicketDetail.getQuantity());
        detail.setNote(transferTicketDetail.getNote());
        details.add(detail);
      }
    } else {
      throw new RpcException(400, "Loại phiếu xuất kho không hợp lệ!");
    }

    ticket.setCreatedBy(request.getCreatedBy());
    ticket.setCreatedOn(LocalDateTime.now());
    ticket.setLastUpdatedOn(LocalDateTime.now());
    ticket.setStatus(request.getStatus());
    ticket.setFile(request.getFile());
    ticket.setIssueTicketDetails(details);

    IssueTicket issueTicket = issueTicketRepository.save(ticket);

    return convertToDto(issueTicket);
  }

  public List<IssueTicketDto> getAllInCompany(Long companyId) {
    return issueTicketRepository.findByCompanyId(companyId)
        .stream()
        .map(this::convertToDto)
        .collect(Collectors.toList());
  }

  public IssueTicketDto getById(Long ticketId) {
    IssueTicket ticket = issueTicketRepository.findById(ticketId)
        .orElseThrow(() -> new RpcException(404, "Không tìm thấy Phiếu xuất kho!"));
    return convertToDto(ticket);
  }

  public IssueTicketDto updateTicket(Long ticketId, IssueTicketData request) {
    IssueTicket ticket = issueTicketRepository.findById(ticketId)
        .orElseThrow(() -> new RpcException(404, "Không tìm thấy Phiếu xuất kho!"));
    if (ticket.getStatus().equals("Đã hoàn thành")) {
      throw new RpcException(400, "Không thể cập nhật phiếu đã hoàn thành!");
    }
    if (ticket.getStatus().equals("Đã hủy")) {
      throw new RpcException(400, "Không thể cập nhật phiếu đã bị hủy!");
    }

    ticket.setStatus(request.getStatus());
    ticket.setLastUpdatedOn(LocalDateTime.now());
    ticket.setCreatedBy(request.getCreatedBy());
    ticket.setIssueDate(request.getIssueDate());
    issueTicketRepository.save(ticket);
    return convertToDto(ticket);
  }

  public String generateTicketCode(Long companyId) {
    String prefix = "IT" + String.format("%04d", companyId);
    String year = String.valueOf(LocalDateTime.now().getYear()).substring(2);
    int count = issueTicketRepository.countByTicketCodeStartingWith(prefix);
    return prefix + year + String.format("%03d", count + 1);
  }

  public List<ItemReportDto> getIssueReport(IssueReportRequest reportRequest, Long companyId) {
    List<IssueTicket> tickets = issueTicketRepository
        .findByCompanyIdAndStatusAndIssueDateBetween(companyId, "Đã hoàn thành",
            reportRequest.getStartTime(), reportRequest.getEndTime());

    if (reportRequest.getIssueType() != null && !reportRequest.getIssueType().equals("Tất cả")) {
      tickets = tickets.stream()
          .filter(t -> t.getIssueType() != null && t.getIssueType().equals(reportRequest.getIssueType()))
          .collect(Collectors.toList());
    }

    if (reportRequest.getWarehouseId() != null && reportRequest.getWarehouseId() != 0) {
      tickets = tickets.stream()
          .filter(
              t -> t.getWarehouse() != null && t.getWarehouse().getWarehouseId().equals(reportRequest.getWarehouseId()))
          .collect(Collectors.toList());
    }

    Map<Long, ItemReportDto> itemReportDtoList = new HashMap<>();

    for (IssueTicket ticket : tickets) {
      List<IssueTicketDetail> details = detailRepository.findByTicketTicketId(ticket.getTicketId());
      for (IssueTicketDetail detail : details) {
        ItemDto item = eventPublisher.getItemById(detail.getItemId());
        if(item == null) {
          throw new RpcException(404, "Không tìm thấy hàng hóa!");
        }
        Long itemId = item.getItemId();
        String itemCode = item.getItemCode();
        String itemName = item.getItemName();
        Double quantity = detail.getQuantity();

        itemReportDtoList.compute(itemId, (key, value) -> {
          if (value == null) {
            ItemReportDto itemReportDto = new ItemReportDto();
            itemReportDto.setItemId(itemId);
            itemReportDto.setItemCode(itemCode);
            itemReportDto.setItemName(itemName);
            itemReportDto.setTotalQuantity(quantity);
            return itemReportDto;
          } else {
            value.setTotalQuantity(value.getTotalQuantity() + quantity);
            return value;
          }
        });
      }
    }

    return new ArrayList<>(itemReportDtoList.values());
  }

  public List<MonthlyInventoryReportDto> getMonthlyIssueReport(Long companyId, String issueType, Long warehouseId) {
    LocalDateTime now = LocalDateTime.now();
    LocalDateTime oneYearAgo = now.minusMonths(11).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0)
        .withNano(0);

    List<IssueTicket> tickets = issueTicketRepository
        .findByCompanyIdAndStatusAndIssueDateBetween(
            companyId, "Đã hoàn thành", oneYearAgo, now);

    if (issueType != null && !issueType.equals("Tất cả")) {
      tickets = tickets.stream()
          .filter(t -> t.getIssueType() != null && t.getIssueType().equals(issueType))
          .collect(Collectors.toList());
    }

    if (warehouseId != null && warehouseId != 0) {
      tickets = tickets.stream()
          .filter(t -> t.getWarehouse() != null && warehouseId.equals(t.getWarehouse().getWarehouseId()))
          .collect(Collectors.toList());
    }

    Map<YearMonth, Double> monthlyList = new TreeMap<>();

    for (IssueTicket ticket : tickets) {
      YearMonth month = YearMonth.from(ticket.getIssueDate());

      List<IssueTicketDetail> details = detailRepository.findByTicketTicketId(ticket.getTicketId());
      for (IssueTicketDetail detail : details) {
        Double quantity = detail.getQuantity();
        monthlyList.merge(month, quantity, Double::sum);
      }
    }

    List<MonthlyInventoryReportDto> result = new ArrayList<>();
    for (int i = 0; i < 12; i++) {
      YearMonth ym = YearMonth.from(oneYearAgo.plusMonths(i));
      Double quantity = monthlyList.getOrDefault(ym, 0.0);
      MonthlyInventoryReportDto dto = new MonthlyInventoryReportDto();
      dto.setMonth(ym.format(DateTimeFormatter.ofPattern("MM/yyyy")));
      dto.setTotalQuantity(quantity);
      result.add(dto);
    }

    return result;
  }

  public IssueTicketDto convertToDto(IssueTicket ticket) {
    IssueTicketDto dto = new IssueTicketDto();
    dto.setTicketId(ticket.getTicketId());
    dto.setCompanyId(ticket.getCompanyId());
    dto.setTicketCode(ticket.getTicketCode());
    dto.setWarehouseId(ticket.getWarehouse().getWarehouseId());
    dto.setWarehouseCode(ticket.getWarehouse().getWarehouseCode());
    dto.setWarehouseName(ticket.getWarehouse().getWarehouseName());
    dto.setIssueDate(ticket.getIssueDate());
    dto.setReason(ticket.getReason());
    dto.setIssueType(ticket.getIssueType());
    dto.setReferenceId(ticket.getReferenceId());

    if (ticket.getIssueType().equals("Sản xuất")) {
      ManufactureOrderDto manufactureOrder = eventPublisher.getManufactureOrderById(ticket.getReferenceId());
      dto.setReferenceCode(manufactureOrder.getMoCode());
    } else if (ticket.getIssueType().equals("Bán hàng")) {
      SalesOrderDto salesOrder = eventPublisher.getSalesOrderById(ticket.getReferenceId());
      dto.setReferenceCode(salesOrder.getSoCode());
    } else if (ticket.getIssueType().equals("Chuyển kho")) {
      TransferTicket transferTicket = transferTicketRepository.findByTicketId(ticket.getReferenceId());
      dto.setReferenceCode(transferTicket.getTicketCode());
    } else {
      dto.setReferenceCode("N/A");
    }

    dto.setCreatedBy(ticket.getCreatedBy());
    dto.setCreatedOn(ticket.getCreatedOn());
    dto.setLastUpdatedOn(ticket.getLastUpdatedOn());
    dto.setStatus(ticket.getStatus());
    dto.setFile(ticket.getFile());

    List<IssueTicketDetailDto> details = detailRepository.findByTicketTicketId(ticket.getTicketId())
        .stream()
        .map(this::convertToDetailDto)
        .collect(Collectors.toList());
    dto.setIssueTicketDetails(details);

    return dto;
  }

  public IssueTicketDetailDto convertToDetailDto(IssueTicketDetail detail) {
    IssueTicketDetailDto dto = new IssueTicketDetailDto();
    dto.setITdetailId(detail.getITdetailId());
    dto.setTicketId(detail.getTicket().getTicketId());
    ItemDto item = eventPublisher.getItemById(detail.getItemId());
    if(item == null) {
      throw new RpcException(404, "Không tìm thấy hàng hóa!");
    }
    dto.setItemId(item.getItemId());
    dto.setItemCode(item.getItemCode());
    dto.setItemName(item.getItemName());

    dto.setQuantity(detail.getQuantity());
    dto.setNote(detail.getNote());

    return dto;
  }

  public List<MonthlyInventoryReportDto> getForecastedIssue(Long companyId, String issueType,
      Long warehouseId) {
    List<MonthlyInventoryReportDto> history = getMonthlyIssueReport(companyId, issueType, warehouseId);

    if (!history.isEmpty()) {
      history.remove(history.size() - 1);
    }

    int n = history.size();
    List<Double> xList = new ArrayList<>();
    List<Double> yList = new ArrayList<>();

    for (int i = 0; i < n; i++) {
      xList.add((double) (i + 1));
      yList.add(history.get(i).getTotalQuantity());
    }

    double sumX = xList.stream().mapToDouble(Double::doubleValue).sum();
    double sumY = yList.stream().mapToDouble(Double::doubleValue).sum();
    double sumXY = 0;
    double sumX2 = 0;

    for (int i = 0; i < n; i++) {
      sumXY += xList.get(i) * yList.get(i);
      sumX2 += xList.get(i) * xList.get(i);
    }

    double a = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    double b = (sumY - a * sumX) / n;

    double currentMonthForecast = a * (n + 1) + b;
    double nextMonthForecast = a * (n + 2) + b;

    YearMonth currentMonth = YearMonth.now();
    MonthlyInventoryReportDto currentMonthDto = new MonthlyInventoryReportDto();
    currentMonthDto.setMonth(currentMonth.format(DateTimeFormatter.ofPattern("MM/yyyy")));
    currentMonthDto.setTotalQuantity(currentMonthForecast);
    history.add(currentMonthDto);

    YearMonth nextMonth = currentMonth.plusMonths(1);
    MonthlyInventoryReportDto nextMonthDto = new MonthlyInventoryReportDto();
    nextMonthDto.setMonth(nextMonth.format(DateTimeFormatter.ofPattern("MM/yyyy")));
    nextMonthDto.setTotalQuantity(nextMonthForecast);
    history.add(nextMonthDto);

    MonthlyInventoryReportDto extraNextMonthDto = new MonthlyInventoryReportDto();
    extraNextMonthDto.setMonth(nextMonth.format(DateTimeFormatter.ofPattern("MM/yyyy")));
    extraNextMonthDto.setTotalQuantity(nextMonthForecast);
    history.add(extraNextMonthDto);

    return history;
  }

}
