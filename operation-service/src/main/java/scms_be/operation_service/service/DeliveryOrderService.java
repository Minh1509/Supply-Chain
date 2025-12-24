package scms_be.operation_service.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.CompletableFuture;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import scms_be.operation_service.event.publisher.EventPublisher;
import scms_be.operation_service.exception.RpcException;
import scms_be.operation_service.model.dto.DeliveryOrderDetailDto;
import scms_be.operation_service.model.dto.DeliveryOrderDto;
import scms_be.operation_service.model.dto.publisher.ItemDto;
import scms_be.operation_service.model.dto.publisher.SalesOrderDetailDto;
import scms_be.operation_service.model.dto.publisher.SalesOrderDto;
import scms_be.operation_service.model.entity.DeliveryOrder;
import scms_be.operation_service.model.entity.DeliveryOrderDetail;
import scms_be.operation_service.model.request.DeliveryOrderRequest.DeliveryOrderData;
import scms_be.operation_service.repository.DeliveryOrderDetailRepository;
import scms_be.operation_service.repository.DeliveryOrderRepository;


@Service
public class DeliveryOrderService {
  @Autowired
  private DeliveryOrderRepository deliveryOrderRepository;

  @Autowired
  private DeliveryOrderDetailRepository deliveryOrderDetailRepository;

  @Autowired
  private EventPublisher eventPublisher;

  public DeliveryOrderDto createDeliveryOrder(DeliveryOrderData deliveryOrderRequest) {
    SalesOrderDto salesOrder = eventPublisher.getSalesOrderById(deliveryOrderRequest.getSoId());
    if (salesOrder == null) {
      throw new RpcException(404, "Không tìm thấy đơn bán hàng!");
    }
    
    if(deliveryOrderRepository.findBySoId(salesOrder.getSoId()) != null) {
      throw new RpcException(400, "Đơn vận chuyển cho đơn bán hàng này đã tồn tại!");
    }
    
    DeliveryOrder deliveryOrder = new DeliveryOrder();
    deliveryOrder.setSoId(salesOrder.getSoId());
    deliveryOrder.setDoCode(generateDoCode(salesOrder.getSoId()));
    deliveryOrder.setCreatedBy(deliveryOrderRequest.getCreatedBy());
    deliveryOrder.setStatus(deliveryOrderRequest.getStatus());

    DeliveryOrder savedDeliveryOrder = deliveryOrderRepository.save(deliveryOrder);

    List<SalesOrderDetailDto> salesOrderDetailList = salesOrder.getSalesOrderDetails();
    System.out.println("Number of sales order details: " + salesOrderDetailList.size());
    
    // Initialize the deliveryOrderDetails list to prevent orphan removal issues
    List<DeliveryOrderDetail> deliveryOrderDetailsList = new ArrayList<>();
    
    for(SalesOrderDetailDto salesOrderDetail : salesOrderDetailList ){
        System.out.println("Processing item ID: " + salesOrderDetail.getItemId());
        ItemDto item = eventPublisher.getItemById(salesOrderDetail.getItemId());
        System.out.println("Retrieved item: " + (item != null ? item.getItemCode() : "null"));
        
      if (item == null) {
        System.err.println("Item not found for ID: " + salesOrderDetail.getItemId());
        throw new RpcException(404, "Không tìm thấy hàng hóa với ID: " + salesOrderDetail.getItemId());
      }
      DeliveryOrderDetail newDoDetail = new DeliveryOrderDetail();
      newDoDetail.setDeliveryOrder(savedDeliveryOrder);
      newDoDetail.setItemId(item.getItemId());
      newDoDetail.setQuantity(salesOrderDetail.getQuantity());
      newDoDetail.setNote(salesOrderDetail.getNote());
      
      DeliveryOrderDetail savedDetail = deliveryOrderDetailRepository.save(newDoDetail);
      deliveryOrderDetailsList.add(savedDetail);
      System.out.println("Saved delivery order detail ID: " + savedDetail.getDeliveryOrderDetailId());
    }
    
    // Set the list to prevent orphan removal from deleting the details
    savedDeliveryOrder.setDeliveryOrderDetails(deliveryOrderDetailsList);

    return convertToDto(savedDeliveryOrder);
  }

  public DeliveryOrderDto getDoById(Long doId) {
    DeliveryOrder deliveryOrder = deliveryOrderRepository.findById(doId)
       .orElseThrow(() -> new RpcException(404, "Không tìm thấy đơn vận chuyển!"));
    return convertToDto(deliveryOrder);
  }

  public DeliveryOrderDto getDoBySalesOrderId(Long soId) {
    DeliveryOrder deliveryOrder = deliveryOrderRepository.findBySoId(soId);
    if (deliveryOrder == null) {
      throw new RpcException(404, "Không tìm thấy đơn vận chuyển!");
    }
    return convertToDto(deliveryOrder);
  }

  public List<DeliveryOrderDto> getAllInCompany(Long companyId) {
    List<SalesOrderDto> salesOrders = eventPublisher.getAllSalesOrdersByCompanyId(companyId);

    List<DeliveryOrder> deliveryOrders = new ArrayList<>();
    for (SalesOrderDto salesOrder : salesOrders) {
      DeliveryOrder deliveryOrder = deliveryOrderRepository.findBySoId(salesOrder.getSoId());
      if (deliveryOrder != null) {
        deliveryOrders.add(deliveryOrder);
      }
    }
    return deliveryOrders.stream()
        .map(this::convertToDto)
        .collect(Collectors.toList());
  }

  public DeliveryOrderDto updateDo(Long doId, DeliveryOrderData request) {
    DeliveryOrder deliveryOrder = deliveryOrderRepository.findById(doId)
        .orElseThrow(() -> new RpcException(404, "Không tìm thấy đơn vận chuyển!"));
    deliveryOrder.setStatus(request.getStatus());
    deliveryOrder.setCreatedBy(request.getCreatedBy());

    deliveryOrderRepository.save(deliveryOrder);
    return convertToDto(deliveryOrder);
  }

  private String generateDoCode(Long soId) {
    String prefix = "DO" + String.valueOf(soId).substring(0, Math.min(5, String.valueOf(soId).length()));
    String year = String.valueOf(LocalDateTime.now().getYear()).substring(2);
    return prefix + year + String.format("%04d", new Random().nextInt(10000));
  }

  public DeliveryOrderDto convertToDto(DeliveryOrder deliveryOrder) {
    DeliveryOrderDto deliveryOrderDto = new DeliveryOrderDto();
    deliveryOrderDto.setDoId(deliveryOrder.getDoId());
    deliveryOrderDto.setDoCode(deliveryOrder.getDoCode());

    ExecutorService executor = Executors.newFixedThreadPool(10);
    try {
      CompletableFuture<SalesOrderDto> salesOrderFuture = CompletableFuture.supplyAsync(
          () -> eventPublisher.getSalesOrderById(deliveryOrder.getSoId()), executor);

      List<DeliveryOrderDetail> detailsList = deliveryOrderDetailRepository
          .findByDeliveryOrder_DoId(deliveryOrder.getDoId());

      Map<Long, CompletableFuture<ItemDto>> itemFutures = detailsList.stream()
          .map(DeliveryOrderDetail::getItemId)
          .distinct()
          .collect(Collectors.toMap(
              itemId -> itemId,
              itemId -> CompletableFuture.supplyAsync(() -> eventPublisher.getItemById(itemId), executor)
          ));

      CompletableFuture<Void> allFutures = CompletableFuture.allOf(
          Stream.concat(
              Stream.of(salesOrderFuture),
              itemFutures.values().stream()
          ).toArray(CompletableFuture[]::new)
      );

      allFutures.join();

      SalesOrderDto saleDtoOrder = salesOrderFuture.get();
      if (saleDtoOrder == null) {
        throw new RpcException(404, "Không tìm thấy đơn bán hàng!");
      }
      deliveryOrderDto.setSoId(saleDtoOrder.getSoId());
      deliveryOrderDto.setSoCode(saleDtoOrder.getSoCode());
      deliveryOrderDto.setCreatedBy(deliveryOrder.getCreatedBy());
      deliveryOrderDto.setCreatedOn(deliveryOrder.getCreatedOn());
      deliveryOrderDto.setLastUpdatedOn(deliveryOrder.getLastUpdatedOn());
      deliveryOrderDto.setDeliveryFromAddress(saleDtoOrder.getDeliveryFromAddress());
      deliveryOrderDto.setDeliveryToAddress(saleDtoOrder.getDeliveryToAddress());
      deliveryOrderDto.setStatus(deliveryOrder.getStatus());

      List<DeliveryOrderDetailDto> deliveryOrderDetails = detailsList.stream()
          .map(detail -> {
            DeliveryOrderDetailDto deliveryOrderDetailDto = new DeliveryOrderDetailDto();
            deliveryOrderDetailDto.setDeliveryOrderDetailId(detail.getDeliveryOrderDetailId());
            deliveryOrderDetailDto.setDeliveryOrderId(detail.getDeliveryOrder().getDoId());
            deliveryOrderDetailDto.setDeliveryOrderCode(detail.getDeliveryOrder().getDoCode());

            try {
              ItemDto item = itemFutures.get(detail.getItemId()).get();
              if (item == null) {
                // Potentially throw or handle null
                throw new RpcException(404, "Không tìm thấy hàng hóa!"); 
              }
              deliveryOrderDetailDto.setItemId(item.getItemId());
              deliveryOrderDetailDto.setItemCode(item.getItemCode());
              deliveryOrderDetailDto.setItemName(item.getItemName());
            } catch (RpcException e) {
              throw e;
            } catch (Exception e) {
               if(e.getCause() instanceof RpcException) throw (RpcException) e.getCause();
               e.printStackTrace();
            }

            deliveryOrderDetailDto.setQuantity(detail.getQuantity());
            deliveryOrderDetailDto.setNote(detail.getNote());
            return deliveryOrderDetailDto;
          })
          .collect(Collectors.toList());

      deliveryOrderDto.setDeliveryOrderDetails(deliveryOrderDetails);
    
    } catch (RpcException e) {
        throw e;
    } catch (Exception e) {
      if (e instanceof RuntimeException) throw (RuntimeException) e;
      e.printStackTrace();
    } finally {
      executor.shutdown();
    }

    return deliveryOrderDto;
  }

  public DeliveryOrderDetailDto convertToDetailDto (DeliveryOrderDetail deliveryOrderDetail) {
    DeliveryOrderDetailDto deliveryOrderDetailDto = new DeliveryOrderDetailDto();
    deliveryOrderDetailDto.setDeliveryOrderDetailId(deliveryOrderDetail.getDeliveryOrderDetailId());
    deliveryOrderDetailDto.setDeliveryOrderId(deliveryOrderDetail.getDeliveryOrder().getDoId());
    deliveryOrderDetailDto.setDeliveryOrderCode(deliveryOrderDetail.getDeliveryOrder().getDoCode());

    ItemDto item = eventPublisher.getItemById(deliveryOrderDetail.getItemId());
    if (item == null) {
      throw new RpcException(404, "Không tìm thấy hàng hóa!");
    }
    deliveryOrderDetailDto.setItemId(item.getItemId());
    deliveryOrderDetailDto.setItemCode(item.getItemCode());
    deliveryOrderDetailDto.setItemName(item.getItemName());
    deliveryOrderDetailDto.setQuantity(deliveryOrderDetail.getQuantity());
    deliveryOrderDetailDto.setNote(deliveryOrderDetail.getNote());
    return deliveryOrderDetailDto;
  }
  
}
