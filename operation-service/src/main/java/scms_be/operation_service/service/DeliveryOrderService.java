package scms_be.operation_service.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

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
    DeliveryOrder deliveryOrder = new DeliveryOrder();
    deliveryOrder.setSalesOrderId(salesOrder.getSoId());
    deliveryOrder.setDoCode(generateDoCode(salesOrder.getSoId()));
    deliveryOrder.setCreatedBy(deliveryOrderRequest.getCreatedBy());
    deliveryOrder.setCreatedOn(LocalDateTime.now());
    deliveryOrder.setLastUpdatedOn(LocalDateTime.now());
    deliveryOrder.setStatus(deliveryOrderRequest.getStatus());

    DeliveryOrder savedDeliveryOrder = deliveryOrderRepository.save(deliveryOrder);

    List<SalesOrderDetailDto> salesOrderDetailList = salesOrder.getSalesOrderDetails();
    for(SalesOrderDetailDto salesOrderDetail : salesOrderDetailList ){
        ItemDto item = eventPublisher.getItemById(salesOrderDetail.getItemId());
      if (item == null) {
        throw new RpcException(404, "Không tìm thấy hàng hóa!");
      }
      DeliveryOrderDetail newDoDetail = new DeliveryOrderDetail();
      newDoDetail.setDeliveryOrder(savedDeliveryOrder);
      newDoDetail.setItemId(item.getItemId());
      newDoDetail.setQuantity(salesOrderDetail.getQuantity());
      newDoDetail.setNote(salesOrderDetail.getNote());
      deliveryOrderDetailRepository.save(newDoDetail);
    }
    deliveryOrderRepository.save(savedDeliveryOrder);

    return convertToDto(savedDeliveryOrder);
  }

  public DeliveryOrderDto getDoById(Long doId) {
    DeliveryOrder deliveryOrder = deliveryOrderRepository.findById(doId)
       .orElseThrow(() -> new RpcException(404, "Không tìm thấy đơn vận chuyển!"));
    return convertToDto(deliveryOrder);
  }

  public DeliveryOrderDto getDoBySalesOrderId(Long soId) {
    DeliveryOrder deliveryOrder = deliveryOrderRepository.findBySalesOrderId(soId);
    if (deliveryOrder == null) {
      throw new RpcException(404, "Không tìm thấy đơn vận chuyển!");
    }
    return convertToDto(deliveryOrder);
  }

  public List<DeliveryOrderDto> getAllInCompany(Long companyId) {
    List<SalesOrderDto> salesOrders = eventPublisher.getAllSalesOrdersByCompanyId(companyId);

    List<DeliveryOrder> deliveryOrders = new ArrayList<>();
    for (SalesOrderDto salesOrder : salesOrders) {
      DeliveryOrder deliveryOrder = deliveryOrderRepository.findBySalesOrderId(salesOrder.getSoId());
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
    deliveryOrder.setLastUpdatedOn(LocalDateTime.now());
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
    
    SalesOrderDto saleDtoOrder = eventPublisher.getSalesOrderById(deliveryOrder.getSalesOrderId());
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

    List<DeliveryOrderDetailDto> deliveryOrderDetails = deliveryOrderDetailRepository
        .findByDeliveryOrder_DoId(deliveryOrder.getDoId())
        .stream()
        .map(this::convertToDetailDto)
        .collect(Collectors.toList());

    deliveryOrderDto.setDeliveryOrderDetails(deliveryOrderDetails);
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
