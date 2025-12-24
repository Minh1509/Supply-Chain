package scms_be.inventory_service.event.publisher;

import java.util.List;
import java.util.Map;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import scms_be.inventory_service.event.constants.EventConstants;
import scms_be.inventory_service.exception.RpcException;
import scms_be.inventory_service.model.ErrorResponse;
import scms_be.inventory_service.model.dto.publisher.BOMDto;
import scms_be.inventory_service.model.dto.publisher.ItemDto;
import scms_be.inventory_service.model.dto.publisher.ManufactureOrderDto;
import scms_be.inventory_service.model.dto.publisher.PurchaseOrderDto;
import scms_be.inventory_service.model.dto.publisher.SalesOrderDto;
import scms_be.inventory_service.model.event.GenericEvent;
import scms_be.inventory_service.model.request.publisher.BOMRequest;
import scms_be.inventory_service.model.request.publisher.ItemRequest;
import scms_be.inventory_service.model.request.publisher.ManuOrderRequest;

@Slf4j
@RequiredArgsConstructor
@Component
public class EventPublisher {
    
    private final RabbitTemplate rabbitTemplate;
    
    private final ObjectMapper objectMapper;

    public ItemDto getItemById(Long itemId) {
        log.info("Getting item by ID: {}", itemId);

        GenericEvent event = new GenericEvent();
        event.setPattern("item.get_by_id");

        ItemRequest request = new ItemRequest();
        request.setItemId(itemId);
        event.setData(request);

        Object response = rabbitTemplate.convertSendAndReceive(EventConstants.GENERAL_SERVICE_QUEUE, event);

        if (response == null) {
            throw new RpcException(504, "No reply or timeout from general service");
        }

        if (response instanceof ItemDto) {
            return (ItemDto) response;
        }

        if (response instanceof ErrorResponse) {
            ErrorResponse err = (ErrorResponse) response;
            throw new RpcException(err.getStatusCode(), err.getMessage());
        }

        // if it's already a List (ArrayList), get the first item
        if (response instanceof List) {
            @SuppressWarnings("unchecked")
            List<Object> rawList = (List<Object>) response;
            if (!rawList.isEmpty()) {
                ItemDto dto = objectMapper.convertValue(rawList.get(0), ItemDto.class);
                log.info("Converted first item from List to ItemDto: {}", dto);
                return dto;
            } else {
                throw new RpcException(404, "Item not found");
            }
        }

        // if it's a Map/LinkedHashMap, convert to ItemDto
        if (response instanceof Map) {
            ItemDto dto = objectMapper.convertValue(response, ItemDto.class);
            log.info("Converted Map to ItemDto: {}", dto);
            return dto;
        }

        throw new RpcException(500, "Unexpected response type: " + response.getClass());
    }

    public List<ItemDto> getAllItemByCompanyId(Long companyId) {
        log.info("Getting item by company ID: {}", companyId);

        GenericEvent event = new GenericEvent();
        event.setPattern("item.get_all_in_company");
        ItemRequest request = new ItemRequest();
        request.setCompanyId(companyId);
        event.setData(request);

        Object response = rabbitTemplate.convertSendAndReceive(EventConstants.GENERAL_SERVICE_QUEUE, event);

        if (response == null) {
            throw new RpcException(504, "No reply or timeout from general service");
        }

        if (response instanceof ErrorResponse) {
            ErrorResponse err = (ErrorResponse) response;
            throw new RpcException(err.getStatusCode(), err.getMessage());
        }

        // if it's already a List (ArrayList), cast it directly
        if (response instanceof List) {
            @SuppressWarnings("unchecked")
            List<Object> rawList = (List<Object>) response;
            List<ItemDto> dtoList = rawList.stream()
                .map(item -> objectMapper.convertValue(item, ItemDto.class))
                .toList();
            log.info("Converted List to ItemDto list: {}", dtoList);
            return dtoList;
        }

        // if it's a Map/LinkedHashMap, convert to ItemDto
        if (response instanceof Map) {
            List<ItemDto> dto = objectMapper.convertValue(response,
                    objectMapper.getTypeFactory().constructCollectionType(List.class, ItemDto.class));
            log.info("Converted Map to ItemDto: {}", dto);
            return dto;
        }

        throw new RpcException(500, "Unexpected response type: " + response.getClass());
    }

    public Map<Long, ItemDto> getItemsByIds(List<Long> itemIds) {
        log.info("Batch getting items by IDs: {}", itemIds);

        if (itemIds == null || itemIds.isEmpty()) {
            return new HashMap<>();
        }

        GenericEvent event = new GenericEvent();
        event.setPattern("item.get_by_ids");

        ItemRequest request = new ItemRequest();
        request.setItemIds(itemIds);
        event.setData(request);

        Object response = rabbitTemplate.convertSendAndReceive(EventConstants.GENERAL_SERVICE_QUEUE, event);

        if (response == null) {
            throw new RpcException(504, "No reply or timeout from general service");
        }

        if (response instanceof ErrorResponse) {
            ErrorResponse err = (ErrorResponse) response;
            throw new RpcException(err.getStatusCode(), err.getMessage());
        }

        if (response instanceof List) {
            @SuppressWarnings("unchecked")
            List<Object> rawList = (List<Object>) response;
            Map<Long, ItemDto> itemsMap = rawList.stream()
                .map(item -> objectMapper.convertValue(item, ItemDto.class))
                .collect(java.util.stream.Collectors.toMap(ItemDto::getItemId, item -> item));
            log.info("Converted List to ItemDto map with {} items", itemsMap.size());
            return itemsMap;
        }

        throw new RpcException(500, "Unexpected response type: " + response.getClass());
    }

    // Function để lấy BOM theo itemId
    public BOMDto getBOMByItemId(Long itemId) {
        log.info("Getting BOM by item ID: {}", itemId);
        
        GenericEvent event = new GenericEvent();
        event.setPattern("bom.get_by_item_id");
        
        BOMRequest request = new BOMRequest();
        request.setItemId(itemId);
        event.setData(request);

        Object response = rabbitTemplate.convertSendAndReceive(EventConstants.OPERATION_SERVICE_QUEUE, event);

        if (response == null) {
            throw new RpcException(504, "No reply or timeout from operation service");
        }

        if (response instanceof BOMDto) {
            BOMDto bomDto = (BOMDto) response;
            log.info("Received BOM data: {}", bomDto);
            return bomDto;
        }

        if (response instanceof ErrorResponse) {
            ErrorResponse error = (ErrorResponse) response;
            log.error("Error getting BOM: {}", error.getMessage());
            throw new RpcException(error.getStatusCode(), error.getMessage());
        }

        if (response instanceof Map) {
            BOMDto dto = objectMapper.convertValue(response, BOMDto.class);
            log.info("Converted Map to BOMDto: {}", dto);
            return dto;
        }

        throw new RpcException(500, "Unexpected response type: " + response.getClass());
    }

    // Function để lấy ManufactureOrder theo moCode
    public ManufactureOrderDto getManufactureOrderByCode(String moCode) {
        log.info("Getting ManufactureOrder by code: {}", moCode);
        
        GenericEvent event = new GenericEvent();
        event.setPattern("manufacture_order.get_by_code");
        
        ManuOrderRequest request = new ManuOrderRequest();
        request.setMoCode(moCode);
        event.setData(request);

        Object response = rabbitTemplate.convertSendAndReceive(EventConstants.OPERATION_SERVICE_QUEUE, event);

        if (response == null) {
            throw new RpcException(504, "No reply or timeout from operation service");
        }

        if (response instanceof ManufactureOrderDto) {
            ManufactureOrderDto moDto = (ManufactureOrderDto) response;
            log.info("Received ManufactureOrder data: {}", moDto);
            return moDto;
        }

        if (response instanceof ErrorResponse) {
            ErrorResponse error = (ErrorResponse) response;
            log.error("Error getting ManufactureOrder: {}", error.getMessage());
            throw new RpcException(error.getStatusCode(), error.getMessage());
        }

        if (response instanceof Map) {
            ManufactureOrderDto dto = objectMapper.convertValue(response, ManufactureOrderDto.class);
            log.info("Converted Map to ManufactureOrderDto: {}", dto);
            return dto;
        }

        throw new RpcException(500, "Unexpected response type: " + response.getClass());
    }

    // Function để lấy ManufactureOrder theo moId
    public ManufactureOrderDto getManufactureOrderById(Long moId) {
        log.info("Getting ManufactureOrder by ID: {}", moId);
        
        GenericEvent event = new GenericEvent();
        event.setPattern("manufacture_order.get_by_id");
        
        ManuOrderRequest request = new ManuOrderRequest();
        request.setMoId(moId);
        event.setData(request);

        Object response = rabbitTemplate.convertSendAndReceive(EventConstants.OPERATION_SERVICE_QUEUE, event);

        if (response == null) {
            throw new RpcException(504, "No reply or timeout from operation service");
        }

        if (response instanceof ManufactureOrderDto) {
            ManufactureOrderDto moDto = (ManufactureOrderDto) response;
            log.info("Received ManufactureOrder data: {}", moDto);
            return moDto;
        }

        if (response instanceof ErrorResponse) {
            ErrorResponse error = (ErrorResponse) response;
            log.error("Error getting ManufactureOrder: {}", error.getMessage());
            throw new RpcException(error.getStatusCode(), error.getMessage());
        }

        if (response instanceof Map) {
            ManufactureOrderDto dto = objectMapper.convertValue(response, ManufactureOrderDto.class);
            log.info("Converted Map to ManufactureOrderDto: {}", dto);
            return dto;
        }

        throw new RpcException(500, "Unexpected response type: " + response.getClass());
    }

    // Function để lấy SalesOrder theo soCode
    public SalesOrderDto getSalesOrderByCode(String soCode) {
        log.info("Getting SalesOrder by code: {}", soCode);
        
        GenericEvent event = new GenericEvent();
        event.setPattern("so.get_by_code");

        Map<String, Object> data = Map.of("soCode", soCode);
        event.setData(data);
        
        Object response = rabbitTemplate.convertSendAndReceive(EventConstants.BUSINESS_SERVICE_QUEUE, event);

        if (response == null) {
            throw new RpcException(504, "No reply or timeout from operation service");
        }

        if (response instanceof SalesOrderDto) {
            SalesOrderDto soDto = (SalesOrderDto) response;
            log.info("Received SalesOrder data: {}", soDto);
            return soDto;
        }

        if (response instanceof ErrorResponse) {
            ErrorResponse error = (ErrorResponse) response;
            log.error("Error getting SalesOrder: {}", error.getMessage());
            throw new RpcException(error.getStatusCode(), error.getMessage());
        }

        if (response instanceof Map) {
            SalesOrderDto dto = objectMapper.convertValue(response, SalesOrderDto.class);
            log.info("Converted Map to SalesOrderDto: {}", dto);
            return dto;
        }

        throw new RpcException(500, "Unexpected response type: " + response.getClass());
    }

    // Function để lấy SalesOrder theo soId
    public SalesOrderDto getSalesOrderById(Long soId) {
        log.info("Getting SalesOrder by ID: {}", soId);
        
        GenericEvent event = new GenericEvent();
        event.setPattern("so.get_by_id");

        Map<String, Object> data = Map.of("soId", soId);
        event.setData(data);

        Object response = rabbitTemplate.convertSendAndReceive(EventConstants.BUSINESS_SERVICE_QUEUE, event);

        if (response == null) {
            throw new RpcException(504, "No reply or timeout from operation service");
        }

        if (response instanceof SalesOrderDto) {
            SalesOrderDto soDto = (SalesOrderDto) response;
            log.info("Received SalesOrder data: {}", soDto);
            return soDto;
        }

        if (response instanceof ErrorResponse) {
            ErrorResponse error = (ErrorResponse) response;
            log.error("Error getting SalesOrder: {}", error.getMessage());
            throw new RpcException(error.getStatusCode(), error.getMessage());
        }

        if (response instanceof Map) {
            SalesOrderDto dto = objectMapper.convertValue(response, SalesOrderDto.class);
            log.info("Converted Map to SalesOrderDto: {}", dto);
            return dto;
        }

        throw new RpcException(500, "Unexpected response type: " + response.getClass());
    }

    // Function để lấy PurchaseOrder theo poCode
    public PurchaseOrderDto getPurchaseOrderByCode(String poCode) {
        log.info("Getting PurchaseOrder by code: {}", poCode);
        
        GenericEvent event = new GenericEvent();
        event.setPattern("po.get_by_code");
        
        Map<String, Object> data = Map.of("poCode", poCode);
        event.setData(data);

        Object response = rabbitTemplate.convertSendAndReceive(EventConstants.BUSINESS_SERVICE_QUEUE, event);

        if (response == null) {
            throw new RpcException(504, "No reply or timeout from operation service");
        }

        if (response instanceof PurchaseOrderDto) {
            PurchaseOrderDto poDto = (PurchaseOrderDto) response;
            log.info("Received PurchaseOrder data: {}", poDto);
            return poDto;
        }

        if (response instanceof ErrorResponse) {
            ErrorResponse error = (ErrorResponse) response;
            log.error("Error getting PurchaseOrder: {}", error.getMessage());
            throw new RpcException(error.getStatusCode(), error.getMessage());
        }

        if (response instanceof Map) {
            PurchaseOrderDto dto = objectMapper.convertValue(response, PurchaseOrderDto.class);
            log.info("Converted Map to PurchaseOrderDto: {}", dto);
            return dto;
        }

        throw new RpcException(500, "Unexpected response type: " + response.getClass());
    }

    // Function để lấy PurchaseOrder theo poId
    public PurchaseOrderDto getPurchaseOrderById(Long poId) {
        log.info("Getting PurchaseOrder by ID: {}", poId);
        
        GenericEvent event = new GenericEvent();
        event.setPattern("po.get_by_id");

        Map<String, Object> data = Map.of("poId", poId);
        event.setData(data);

        Object response = rabbitTemplate.convertSendAndReceive(EventConstants.BUSINESS_SERVICE_QUEUE, event);

        if (response == null) {
            throw new RpcException(504, "No reply or timeout from operation service");
        }

        if (response instanceof PurchaseOrderDto) {
            PurchaseOrderDto poDto = (PurchaseOrderDto) response;
            log.info("Received PurchaseOrder data: {}", poDto);
            return poDto;
        }

        if (response instanceof ErrorResponse) {
            ErrorResponse error = (ErrorResponse) response;
            log.error("Error getting PurchaseOrder: {}", error.getMessage());
            throw new RpcException(error.getStatusCode(), error.getMessage());
        }

        if (response instanceof Map) {
            PurchaseOrderDto dto = objectMapper.convertValue(response, PurchaseOrderDto.class);
            log.info("Converted Map to PurchaseOrderDto: {}", dto);
            return dto;
        }

        throw new RpcException(500, "Unexpected response type: " + response.getClass());
    }
    public void publishProductBatchStatusUpdate(String batchNo, String newStatus) {
        log.info("Publishing product batch status update: batchNo={}, newStatus={}", batchNo, newStatus);
        
        GenericEvent event = new GenericEvent();
        event.setPattern("product.update_batch_status");
        
        Map<String, Object> data = new java.util.HashMap<>();
        data.put("batchNo", batchNo);
        data.put("newStatus", newStatus);
        event.setData(data);
        
        rabbitTemplate.convertAndSend(EventConstants.GENERAL_SERVICE_QUEUE, event);
    }
}