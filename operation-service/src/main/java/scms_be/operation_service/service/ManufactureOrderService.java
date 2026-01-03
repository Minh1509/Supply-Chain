package scms_be.operation_service.service;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.CompletableFuture;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;
import scms_be.operation_service.event.publisher.EventPublisher;
import scms_be.operation_service.exception.RpcException;
import scms_be.operation_service.model.dto.ItemReportDto;
import scms_be.operation_service.model.dto.ManufactureOrderDto;
import scms_be.operation_service.model.dto.MonthlyManuReportDto;
import scms_be.operation_service.model.dto.publisher.ItemDto;
import scms_be.operation_service.model.dto.publisher.ManufactureLineDto;
import scms_be.operation_service.model.entity.BOM;
import scms_be.operation_service.model.entity.ManufactureOrder;
import scms_be.operation_service.model.entity.ManufactureStage;
import scms_be.operation_service.model.entity.ManufactureStageDetail;
import scms_be.operation_service.model.request.ManuOrderRequest.ManuOrderData;
import scms_be.operation_service.model.request.ManuProcessRequest.ManuProcessData;
import scms_be.operation_service.model.request.ManuReportRequest;
import scms_be.operation_service.repository.BOMRepository;
import scms_be.operation_service.repository.ManufactureOrderRepository;
import scms_be.operation_service.repository.ManufactureStageDetailRepository;
import scms_be.operation_service.repository.ManufactureStageRepository;

import java.util.concurrent.*;

@Slf4j
@Service
public class ManufactureOrderService {

  @Autowired
  private ManufactureOrderRepository manufactureOrderRepository;

  @Autowired
  private ManufactureStageRepository stageRepository;

  @Autowired
  private ManufactureStageDetailRepository stageDetailRepository;

  @Autowired
  private ManufactureProcessService processService;

  @Autowired
  private BOMRepository bomRepository;

  @Autowired
  private EventPublisher eventPublisher;

  public ManufactureOrderDto createOrder(ManuOrderData orderRequest) {
    BOM bom = bomRepository.findByItemId(orderRequest.getItemId());
    if (bom == null) {
      throw new RpcException(404, "Hàng hóa chưa có BOM!");
    }
    ManufactureStage stage = stageRepository.findByItemIdAndStatus(orderRequest.getItemId(), "Đang sử dụng");
    if (stage == null) {
      throw new RpcException(404, "Chưa thiết lập công đoạn sản xuất cho hàng hóa này!");
    }

    ManufactureOrder order = new ManufactureOrder();
    order.setMoCode(generateMOCode(orderRequest.getItemId(),
        orderRequest.getLineId()));
    order.setType(orderRequest.getType());
    order.setQuantity(orderRequest.getQuantity());
    order.setEstimatedStartTime(orderRequest.getEstimatedStartTime());
    order.setEstimatedEndTime(orderRequest.getEstimatedEndTime());
    order.setCreatedBy(orderRequest.getCreatedBy());

    ItemDto itemDto = eventPublisher.getItemById(orderRequest.getItemId());
    if (itemDto == null) {
      throw new RpcException(404, "Không tìm thấy hàng hóa!");
    }
    order.setItemId(itemDto.getItemId());
    ManufactureLineDto lineDto = eventPublisher.getManufactureLineById(orderRequest.getLineId());
    if (lineDto == null) {
      throw new RpcException(404, "Không tìm thấy dây chuyền sản xuất!");
    }
    order.setLineId(lineDto.getLineId());
    order.setStatus(orderRequest.getStatus());
    order.setProductsGenerated(false);

    manufactureOrderRepository.save(order);
    ManufactureStage newStage = stage;
    List<ManufactureStageDetail> stageDetailList = stageDetailRepository.findByStage_StageId(newStage.getStageId());
    for (ManufactureStageDetail stageDetail : stageDetailList) {
      ManuProcessData processRequest = new ManuProcessData();
      processRequest.setMoId(order.getMoId());
      processRequest.setStageDetailId(stageDetail.getStageDetailId());

      processService.createManuProcess(processRequest);
    }

    return convertToDto(order);
  }

  public List<ManufactureOrderDto> getAllManufactureOrdersbyItemId(Long itemId) {
    return manufactureOrderRepository.findByItemId(itemId)
        .stream()
        .map(this::convertToDto)
        .collect(Collectors.toList());
  }

  public List<ManufactureOrderDto> getAllManufactureOrdersByCompanyId(Long companyId) {
    List<ItemDto> items = eventPublisher.GetItemAllByCompanyId(companyId);
    return items.stream()
        .map(item -> {
          List<ManufactureOrder> orders = manufactureOrderRepository.findByItemId(item.getItemId());
          return orders.stream()
              .map(this::convertToDto)
              .collect(Collectors.toList());
        })
        .flatMap(List::stream)
        .collect(Collectors.toList());
  }

  public ManufactureOrderDto getById(Long moId) {
  ManufactureOrder mo = manufactureOrderRepository.findById(moId)
    .orElseThrow(() -> new RpcException(404, "Không tìm thấy công lệnh sản xuất!"));
    return convertToDto(mo);
  }

  public ManufactureOrderDto getByCode(String moCode) {
  ManufactureOrder mo = manufactureOrderRepository.findByMoCode(moCode);
  if(mo == null){
    throw new RpcException(404, "Không tìm thấy công lệnh sản xuất!");
  }
    return convertToDto(mo);
  }

  public String getMoCodeById(Long moId) {
    ManufactureOrder mo = manufactureOrderRepository.findById(moId)
      .orElseThrow(() -> new RpcException(404, "Không tìm thấy công lệnh sản xuất!"));
    return mo.getMoCode();
  }

  public ManufactureOrderDto update(Long id, ManuOrderData update) {
  ManufactureOrder mo = manufactureOrderRepository.findById(id)
    .orElseThrow(() -> new RpcException(404, "Không tìm thấy công lệnh sản xuất!"));

    mo.setType(update.getType());
    mo.setQuantity(update.getQuantity());
    mo.setEstimatedStartTime(update.getEstimatedStartTime());
    mo.setEstimatedEndTime(update.getEstimatedEndTime());
    mo.setCreatedBy(update.getCreatedBy());
    mo.setStatus(update.getStatus());

    return convertToDto(manufactureOrderRepository.save(mo));
  }

  public List<ItemReportDto> getManuReport(ManuReportRequest reportRequest, Long companyId) {
    List<ItemDto> items = eventPublisher.GetItemAllByCompanyId(companyId);
    List<ManufactureOrder> mos = new ArrayList<>();
    for (ItemDto item : items) {
      ManufactureOrder mo = manufactureOrderRepository
          .findByItemIdAndStatusAndLastUpdatedOnBetween(item.getItemId(), "Đã hoàn thành",
              reportRequest.getStartTime(), reportRequest.getEndTime());
      if (mo != null) {
        mos.add(mo);
      }
    }

    if (reportRequest.getType() != null && !reportRequest.getType().equals("Tất cả")) {
      mos = mos.stream()
          .filter(mo -> mo.getType() != null && mo.getType().equals(reportRequest.getType()))
          .collect(Collectors.toList());
    }

    Map<Long, ItemReportDto> itemReportDtoList = new HashMap<>();

    for (ManufactureOrder mo : mos) {

      ItemDto item = eventPublisher.getItemById(mo.getItemId());
      if (item == null) {
        throw new RpcException(404, "Không tìm thấy hàng hóa!");
      }
      Double quantity = mo.getQuantity();

      itemReportDtoList.compute(item.getItemId(), (key, value) -> {
        if (value == null) {
          ItemReportDto itemReportDto = new ItemReportDto();
          itemReportDto.setItemId(item.getItemId());
          itemReportDto.setItemCode(item.getItemCode());
          itemReportDto.setItemName(item.getItemName());
          itemReportDto.setTotalQuantity(quantity);
          return itemReportDto;
        } else {
          value.setTotalQuantity(value.getTotalQuantity() + quantity);
          return value;
        }
      });
    }

    return new ArrayList<>(itemReportDtoList.values());
  }

  public List<MonthlyManuReportDto> getMonthlyManuReport(Long companyId, String type) {
    LocalDateTime now = LocalDateTime.now();
    LocalDateTime oneYearAgo = now.minusMonths(11).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0)
        .withNano(0);

    List<ItemDto> items = eventPublisher.GetItemAllByCompanyId(companyId);
    List<ManufactureOrder> mos = new ArrayList<>();
    for (ItemDto item : items) {
      List<ManufactureOrder> moList = manufactureOrderRepository
          .findAllByItemIdAndStatusAndLastUpdatedOnBetween(item.getItemId(), "Đã hoàn thành",
              oneYearAgo, now);
      if (moList != null && !moList.isEmpty()) {
        mos.addAll(moList);
      }
    }

    if (type != null && !type.equals("Tất cả")) {
      mos = mos.stream()
          .filter(mo -> mo.getType() != null && mo.getType().equals(type))
          .collect(Collectors.toList());
    }

    Map<YearMonth, Double> monthlyList = new TreeMap<>();

    for (ManufactureOrder mo : mos) {
      YearMonth month = YearMonth.from(mo.getLastUpdatedOn());
        Double quantity = mo.getQuantity();
        monthlyList.merge(month, quantity, Double::sum);
    }

    List<MonthlyManuReportDto> result = new ArrayList<>();
    for (int i = 0; i < 12; i++) {
      YearMonth ym = YearMonth.from(oneYearAgo.plusMonths(i));
      Double quantity = monthlyList.getOrDefault(ym, 0.0);
      MonthlyManuReportDto dto = new MonthlyManuReportDto();
      dto.setMonth(ym.format(DateTimeFormatter.ofPattern("MM/yyyy")));
      dto.setTotalQuantity(quantity);
      result.add(dto);
    }

    return result;
  }

  public String generateMOCode(Long itemId, Long lineId) {
    int count = manufactureOrderRepository.countByItemIdAndLineId(itemId, lineId);
    return "MO" + itemId + lineId + String.format("%d", count + 1);
  }

  public ManufactureOrderDto completeMO(Long moId, Double completedQuantity) {
    ManufactureOrder mo = manufactureOrderRepository.findById(moId)
        .orElseThrow(() -> new RpcException(404, "Không tìm thấy lệnh sản xuất!"));
    
    mo.setCompletedQuantity(completedQuantity);
    mo.setStatus("Đã hoàn thành");
    
    if (mo.getBatchNo() == null || mo.getBatchNo().isEmpty()) {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        mo.setBatchNo("BATCH-" + mo.getMoCode() + "-" + timestamp);
    }

    boolean needToCreateProducts = (mo.getProductsGenerated() == null || Boolean.FALSE.equals(mo.getProductsGenerated()));
    
    if (needToCreateProducts) {
        ItemDto item = eventPublisher.getItemById(mo.getItemId());
        
        if (item != null && Boolean.TRUE.equals(item.getIsSellable())) {
            try {
                List<Map<String, Object>> products = eventPublisher.createProductBatchSync(
                    mo.getItemId(), 
                    completedQuantity.intValue(), 
                    mo.getBatchNo(), 
                    mo.getMoId()
                );
                
                log.info("Successfully created {} products for MO {} (batch: {})", 
                         products.size(), mo.getMoCode(), mo.getBatchNo());
                
                mo.setProductsGenerated(true);
                
            } catch (RpcException e) {
                log.error("Failed to create products for MO {}: {}", mo.getMoCode(), e.getMessage());
                throw new RpcException(500, "Hoàn thành MO thành công nhưng không thể tạo products: " + e.getMessage());
                
            } catch (Exception e) {
                log.error("Unexpected error creating products: {}", e.getMessage());
                throw new RpcException(500, "Lỗi không xác định khi tạo products: " + e.getMessage());
            }
            
        } else {
            mo.setProductsGenerated(true);
        }
    }
    
    return convertToDto(manufactureOrderRepository.save(mo));
  }

  private ManufactureOrderDto convertToDto(ManufactureOrder mo) {
    ManufactureOrderDto dto = new ManufactureOrderDto();
    dto.setMoId(mo.getMoId());
    dto.setMoCode(mo.getMoCode());

    dto.setType(mo.getType());
    dto.setQuantity(mo.getQuantity());
    dto.setEstimatedStartTime(mo.getEstimatedStartTime());
    dto.setEstimatedEndTime(mo.getEstimatedEndTime());
    dto.setCreatedBy(mo.getCreatedBy());
    dto.setCreatedOn(mo.getCreatedOn());
    dto.setLastUpdatedOn(mo.getLastUpdatedOn());
    dto.setStatus(mo.getStatus());
    dto.setBatchNo(mo.getBatchNo());
    dto.setCompletedQuantity(mo.getCompletedQuantity());
    dto.setProductsGenerated(mo.getProductsGenerated());

    ExecutorService executor = Executors.newFixedThreadPool(5);

    try {
      CompletableFuture<ItemDto> itemFuture = CompletableFuture.supplyAsync(
          () -> eventPublisher.getItemById(mo.getItemId()), executor);

      CompletableFuture<ManufactureLineDto> lineFuture = CompletableFuture.supplyAsync(
          () -> eventPublisher.getManufactureLineById(mo.getLineId()), executor);

      CompletableFuture.allOf(itemFuture, lineFuture).join();

      ItemDto item = itemFuture.get();
      if (item == null) {
        throw new RpcException(404, "Không tìm thấy hàng hóa!");
      }
      dto.setItemId(item.getItemId());
      dto.setItemCode(item.getItemCode());
      dto.setItemName(item.getItemName());

      ManufactureLineDto line = lineFuture.get();
      if (line == null) {
        throw new RpcException(404, "Không tìm thấy dây chuyền!");
      }
      dto.setLineId(line.getLineId());
      dto.setLineCode(line.getLineCode());
      dto.setLineName(line.getLineName());

    } catch (Exception e) {
      if (e instanceof RpcException) {
        throw (RpcException) e;
      }
      e.printStackTrace();
    } finally {
      executor.shutdown();
    }

    return dto;
  }
}
