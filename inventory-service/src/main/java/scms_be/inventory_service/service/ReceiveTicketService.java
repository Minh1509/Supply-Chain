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

import org.hibernate.cache.spi.support.AbstractReadWriteAccess.Item;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import scms_be.inventory_service.event.publisher.EventPublisher;
import scms_be.inventory_service.exception.RpcException;
import scms_be.inventory_service.model.dto.ItemReportDto;
import scms_be.inventory_service.model.dto.MonthlyInventoryReportDto;
import scms_be.inventory_service.model.dto.ReceiveTickeDto;
import scms_be.inventory_service.model.dto.ReceiveTicketDetailDto;
import scms_be.inventory_service.model.dto.publisher.BOMDetailDto;
import scms_be.inventory_service.model.dto.publisher.BOMDto;
import scms_be.inventory_service.model.dto.publisher.ItemDto;
import scms_be.inventory_service.model.dto.publisher.ManufactureOrderDto;
import scms_be.inventory_service.model.dto.publisher.PurchaseOrderDetailDto;
import scms_be.inventory_service.model.dto.publisher.PurchaseOrderDto;
import scms_be.inventory_service.model.entity.ReceiveTicket;
import scms_be.inventory_service.model.entity.ReceiveTicketDetail;
import scms_be.inventory_service.model.entity.TransferTicket;
import scms_be.inventory_service.model.entity.TransferTicketDetail;
import scms_be.inventory_service.model.entity.Warehouse;
import scms_be.inventory_service.model.request.ReceiveReportRequest;
import scms_be.inventory_service.model.request.ReceiveTicketRequest.ReceiveTicketData;
import scms_be.inventory_service.repository.ReceiveTicketDetailRepository;
import scms_be.inventory_service.repository.ReceiveTicketRepository;
import scms_be.inventory_service.repository.TransferTicketRepository;
import scms_be.inventory_service.repository.WarehouseRepository;

@Service
public class ReceiveTicketService {

  @Autowired
  private ReceiveTicketRepository receiveTicketRepository;

  @Autowired
  private ReceiveTicketDetailRepository detailRepository;

  @Autowired
  private WarehouseRepository warehouseRepository;

  @Autowired
  private TransferTicketRepository transferTicketRepository;

  @Autowired
  private EventPublisher eventPublisher;

  public ReceiveTickeDto create(ReceiveTicketData request) {
    Warehouse warehouse = warehouseRepository.findById(request.getWarehouseId())
        .orElseThrow(() -> new RpcException(404, "Không tìm thấy kho!"));

    ReceiveTicket ticket = new ReceiveTicket();
    ticket.setCompanyId(request.getCompanyId());
    ticket.setWarehouse(warehouse);
    ticket.setTicketCode(generateTicketCode(request.getCompanyId()));
    ticket.setReceiveDate(request.getReceiveDate());
    ticket.setReason(request.getReason());
    ticket.setReceiveType(request.getReceiveType());

    List<ReceiveTicketDetail> details = new ArrayList<>();
    ManufactureOrderDto manufactureOrder = null;

    if (request.getReceiveType().equals("Sản xuất")) {
      manufactureOrder = eventPublisher.getManufactureOrderByCode(request.getReferenceCode());
      if (manufactureOrder == null) {
        throw new RpcException(404, "Không tìm thấy công lệnh sản xuất!");
      }
      ticket.setReferenceId(manufactureOrder.getMoId());

      // BOMDto bom = eventPublisher.getBOMByItemId(manufactureOrder.getItemId());
      // List<BOMDetailDto> bomDetails = bom.getBomDetails();
      // for (BOMDetailDto bomDetail : bomDetails) {
      //   ReceiveTicketDetail detail = new ReceiveTicketDetail();
      //   detail.setTicket(ticket);
      //   ItemDto item = eventPublisher.getItemById(bomDetail.getItemId());
      //   if(item == null) {
      //     throw new RpcException(404, "Không tìm thấy hàng hóa!");
      //   }
      //   detail.setItemId(item.getItemId());
      //   detail.setQuantity(bomDetail.getQuantity() * manufactureOrder.getQuantity());
      //   details.add(detail);
      // }
      ReceiveTicketDetail detail = new ReceiveTicketDetail();
      detail.setTicket(ticket);
      ItemDto item = eventPublisher.getItemById(manufactureOrder.getItemId());
      
      detail.setItemId(item.getItemId());
      detail.setQuantity(manufactureOrder.getQuantity());
      details.add(detail);
    } else if (request.getReceiveType().equals("Mua hàng")) {
      PurchaseOrderDto purchaseOrder = eventPublisher.getPurchaseOrderByCode(request.getReferenceCode());
      if (purchaseOrder == null) {
        throw new RpcException(404, "Không tìm thấy đơn mua hàng!");
      }
      ticket.setReferenceId(purchaseOrder.getPoId());
      for (PurchaseOrderDetailDto purchaseOrderDetail : purchaseOrder.getPurchaseOrderDetails()) {
        ReceiveTicketDetail detail = new ReceiveTicketDetail();
        detail.setTicket(ticket);
        ItemDto item = eventPublisher.getItemById(purchaseOrderDetail.getItemId());
        if(item == null) {
          throw new RpcException(404, "Không tìm thấy hàng hóa!");
        }
        detail.setItemId(item.getItemId());
        detail.setQuantity(purchaseOrderDetail.getQuantity());
        detail.setNote(purchaseOrderDetail.getNote());
        details.add(detail);
      }
    } else if (request.getReceiveType().equals("Chuyển kho")) {
      TransferTicket transferTicket = transferTicketRepository.findByTicketCodeWithDetails(request.getReferenceCode());
      if (transferTicket == null) {
        throw new RpcException(404, "Không tìm thấy đơn chuyển kho!");
      }
      ticket.setReferenceId(transferTicket.getTicketId());
      for (TransferTicketDetail transferTicketDetail : transferTicket.getTransferTicketDetails()) {
        ReceiveTicketDetail detail = new ReceiveTicketDetail();
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
      throw new RpcException(400, "Loại phiếu nhập kho không hợp lệ!");
    }

    ticket.setCreatedBy(request.getCreatedBy());
    ticket.setStatus(request.getStatus());
    ticket.setFile(request.getFile());
    ticket.setReceiveTicketDetails(details);

    ReceiveTicket receiveTicket = receiveTicketRepository.save(ticket);
    
    // Trigger event update product status
    if (request.getReceiveType().equals("Sản xuất") && 
        "Đã hoàn thành".equals(receiveTicket.getStatus()) && 
        manufactureOrder != null && 
        manufactureOrder.getBatchNo() != null) {
        
        eventPublisher.publishProductBatchStatusUpdate(manufactureOrder.getBatchNo(), "IN_WAREHOUSE");
    }

    return convertToDto(receiveTicket);
  }

  public List<ReceiveTickeDto> getAllInCompany(Long companyId) {
    return receiveTicketRepository.findByCompanyId(companyId)
        .stream()
        .map(this::convertToDto)
        .collect(Collectors.toList());
  }

  public ReceiveTickeDto getById(Long ticketId) {
    ReceiveTicket ticket = receiveTicketRepository.findById(ticketId)
        .orElseThrow(() -> new RpcException(404, "Không tìm thấy Phiếu nhập kho!"));
    return convertToDto(ticket);
  }

  public ReceiveTickeDto update(Long ticketId, ReceiveTicketData request) {
    ReceiveTicket ticket = receiveTicketRepository.findById(ticketId)
        .orElseThrow(() -> new RpcException(404, "Không tìm thấy Phiếu nhập kho!"));
    if (ticket.getStatus().equals("Đã hoàn thành")) {
      throw new RpcException(400, "Không thể cập nhật phiếu đã hoàn thành!");
    }
    if (ticket.getStatus().equals("Đã hủy")) {
      throw new RpcException(400, "Không thể cập nhật phiếu đã bị hủy!");
    }
    ticket.setStatus(request.getStatus());
    ticket.setCreatedBy(request.getCreatedBy());
    ticket.setReceiveDate(request.getReceiveDate());

    receiveTicketRepository.save(ticket);
    return convertToDto(ticket);
  }

  public String generateTicketCode(Long companyId) {
    String prefix = "RT" + String.format("%04d", companyId);
    String year = String.valueOf(LocalDateTime.now().getYear()).substring(2);
    int count = receiveTicketRepository.countByTicketCodeStartingWith(prefix);
    return prefix + year + String.format("%03d", count + 1);
  }

  public List<ItemReportDto> getReceiveReport(ReceiveReportRequest reportRequest, Long companyId) {
    List<ReceiveTicket> tickets = receiveTicketRepository
        .findByCompanyIdAndStatusAndLastUpdatedOnBetween(companyId, "Đã nhập kho", reportRequest.getStartTime(), reportRequest.getEndTime());

    if (reportRequest.getReceiveType() != null && !reportRequest.getReceiveType().equals("Tất cả")) {
      tickets = tickets.stream()
          .filter(t -> t.getReceiveType() != null && t.getReceiveType().equals(reportRequest.getReceiveType()))
          .collect(Collectors.toList());
    }

    if (reportRequest.getWarehouseId() != null && reportRequest.getWarehouseId() != 0) {
      tickets = tickets.stream()
          .filter(
              t -> t.getWarehouse() != null && t.getWarehouse().getWarehouseId().equals(reportRequest.getWarehouseId()))
          .collect(Collectors.toList());
    }

    Map<Long, ItemReportDto> itemReportDtoList = new HashMap<>();

    for (ReceiveTicket ticket : tickets) {
      List<ReceiveTicketDetail> details = detailRepository.findByTicketTicketId(ticket.getTicketId());
      for (ReceiveTicketDetail detail : details) {
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

  public List<MonthlyInventoryReportDto> getMonthlyReceiveReport(Long companyId, String receiveType, Long warehouseId) {
    LocalDateTime now = LocalDateTime.now();
    LocalDateTime oneYearAgo = now.minusMonths(11).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0)
        .withNano(0);

    List<ReceiveTicket> tickets = receiveTicketRepository
        .findByCompanyIdAndStatusAndLastUpdatedOnBetween(
            companyId, "Đã nhập kho", oneYearAgo, now);

    if (receiveType != null && !receiveType.equals("Tất cả")) {
      tickets = tickets.stream()
          .filter(t -> t.getReceiveType() != null && t.getReceiveType().equals(receiveType))
          .collect(Collectors.toList());
    }

    if (warehouseId != null && warehouseId != 0) {
      tickets = tickets.stream()
          .filter(t -> t.getWarehouse() != null && warehouseId.equals(t.getWarehouse().getWarehouseId()))
          .collect(Collectors.toList());
    }

    Map<YearMonth, Double> monthlyList = new TreeMap<>();

    for (ReceiveTicket ticket : tickets) {
      YearMonth month = YearMonth.from(ticket.getLastUpdatedOn());

      List<ReceiveTicketDetail> details = detailRepository.findByTicketTicketId(ticket.getTicketId());
      for (ReceiveTicketDetail detail : details) {
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

  public ReceiveTickeDto convertToDto(ReceiveTicket ticket) {
    ReceiveTickeDto dto = new ReceiveTickeDto();
    dto.setTicketId(ticket.getTicketId());
    dto.setCompanyId(ticket.getCompanyId());
    dto.setTicketCode(ticket.getTicketCode());
    dto.setWarehouseId(ticket.getWarehouse().getWarehouseId());
    dto.setWarehouseCode(ticket.getWarehouse().getWarehouseCode());
    dto.setWarehouseName(ticket.getWarehouse().getWarehouseName());
    dto.setReceiveDate(ticket.getReceiveDate());
    dto.setReason(ticket.getReason());
    dto.setReceiveType(ticket.getReceiveType());
    dto.setReferenceId(ticket.getReferenceId());

    if (ticket.getReceiveType().equals("Sản xuất")) {
      if (ticket.getReferenceId() != null) {
        ManufactureOrderDto manufactureOrder = eventPublisher.getManufactureOrderById(ticket.getReferenceId());
        dto.setReferenceCode(manufactureOrder != null ? manufactureOrder.getMoCode() : "N/A");
      } else {
        dto.setReferenceCode("N/A");
      }
    } else if (ticket.getReceiveType().equals("Mua hàng")) {
      if (ticket.getReferenceId() != null) {
        PurchaseOrderDto purchaseOrder = eventPublisher.getPurchaseOrderById(ticket.getReferenceId());
        dto.setReferenceCode(purchaseOrder != null ? purchaseOrder.getPoCode() : "N/A");
      } else {
        dto.setReferenceCode("N/A");
      }
    } else if (ticket.getReceiveType().equals("Chuyển kho")) {
      TransferTicket transferTicket = transferTicketRepository.findByTicketIdWithDetails(ticket.getReferenceId());
      dto.setReferenceCode(transferTicket != null ? transferTicket.getTicketCode() : "N/A");
    } else {
      dto.setReferenceCode("N/A");
    }

    dto.setCreatedBy(ticket.getCreatedBy());
    dto.setCreatedOn(ticket.getCreatedOn());
    dto.setLastUpdatedOn(ticket.getLastUpdatedOn());
    dto.setStatus(ticket.getStatus());
    dto.setFile(ticket.getFile());

    List<ReceiveTicketDetailDto> details = detailRepository.findByTicketTicketId(ticket.getTicketId())
        .stream()
        .map(this::convertToDetailDto)
        .collect(Collectors.toList());
    dto.setReceiveTicketDetails(details);

    return dto;
  }

  public ReceiveTicketDetailDto convertToDetailDto(ReceiveTicketDetail detail) {
    ReceiveTicketDetailDto dto = new ReceiveTicketDetailDto();
    dto.setRTdetailId(detail.getRTdetailId());
    dto.setTicketId(detail.getTicket().getTicketId());
    ItemDto item = eventPublisher.getItemById(detail.getItemId());
    if (item == null) {
      throw new RpcException(404, "Không tìm thấy hàng hóa!");
    }
    dto.setItemId(item.getItemId());
    dto.setItemCode(item.getItemCode());
    dto.setItemName(item.getItemName());
    dto.setQuantity(detail.getQuantity());
    dto.setNote(detail.getNote());
    return dto;
  }
}
