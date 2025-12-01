package scms_be.operation_service.event.publisher;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import scms_be.operation_service.event.constants.EventConstants;
import scms_be.operation_service.exception.RpcException;
import scms_be.operation_service.model.ErrorResponse;
import scms_be.operation_service.model.dto.publisher.ItemDto;
import scms_be.operation_service.model.dto.publisher.ManufactureLineDto;
import scms_be.operation_service.model.dto.publisher.SalesOrderDto;
import scms_be.operation_service.model.event.GenericEvent;
import scms_be.operation_service.model.request.publisher.ItemRequest;

@Slf4j
@Component
@RequiredArgsConstructor
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

        // if it's a Map/LinkedHashMap, convert to ItemDto
        if (response instanceof Map) {
            ItemDto dto = objectMapper.convertValue(response, ItemDto.class);
            log.info("Converted Map to ItemDto: {}", dto);
            return dto;
        }

        throw new RpcException(500, "Unexpected response type: " + response.getClass());
    }

    public List<ItemDto> GetItemAllByCompanyId(Long companyId) {
        log.info("Getting all items by Company ID: {}", companyId);

        GenericEvent event = new GenericEvent();
        event.setPattern("item.get_all_in_company");

        ItemRequest request = new ItemRequest();
        request.setCompanyId(companyId);
        event.setData(request);

        Object response = rabbitTemplate.convertSendAndReceive(EventConstants.GENERAL_SERVICE_QUEUE, event);

        if (response == null) {
            throw new RpcException(504, "No reply or timeout from general service");
        }

        log.info("Raw response type: {}", response.getClass().getName());
        log.info("Raw response content: {}", response.toString());

        if (response instanceof ErrorResponse) {
            ErrorResponse error = (ErrorResponse) response;
            log.error("Error getting item list: {}", error.getMessage());
            throw new RpcException(error.getStatusCode(), error.getMessage());
        }

        // Check if response is a Map (wrapped response)
        if (response instanceof Map) {
            Map<String, Object> responseMap = (Map<String, Object>) response;
            log.info("Response is a Map with keys: {}", responseMap.keySet());
            
            // Check if it's an error response (has statusCode and message keys)
            if (responseMap.containsKey("statusCode") && responseMap.containsKey("message")) {
                Integer statusCode = (Integer) responseMap.get("statusCode");
                String message = (String) responseMap.get("message");
                log.error("Received error response from general service: {} - {}", statusCode, message);
                throw new RpcException(statusCode, message);
            }
            
            // Check if there's a 'data' field containing the actual list
            if (responseMap.containsKey("data")) {
                Object data = responseMap.get("data");
                log.info("Found 'data' field of type: {}", data.getClass().getName());
                try {
                    List<ItemDto> itemList = objectMapper.convertValue(data, new TypeReference<List<ItemDto>>() {});
                    log.info("Successfully converted data field to item list with {} items", itemList.size());
                    return itemList;
                } catch (Exception e) {
                    log.error("Failed to convert 'data' field to List<ItemDto>: {}", e.getMessage());
                }
            }
            
            // Check if there's an 'items' field containing the actual list
            if (responseMap.containsKey("items")) {
                Object items = responseMap.get("items");
                log.info("Found 'items' field of type: {}", items.getClass().getName());
                try {
                    List<ItemDto> itemList = objectMapper.convertValue(items, new TypeReference<List<ItemDto>>() {});
                    log.info("Successfully converted items field to item list with {} items", itemList.size());
                    return itemList;
                } catch (Exception e) {
                    log.error("Failed to convert 'items' field to List<ItemDto>: {}", e.getMessage());
                }
            }
            
            // If no 'data' or 'items' field, try to convert the whole map as if it's a single item wrapped in object
            try {
                List<ItemDto> itemList = objectMapper.convertValue(response, new TypeReference<List<ItemDto>>() {});
                log.info("Successfully converted whole map to item list with {} items", itemList.size());
                return itemList;
            } catch (Exception e) {
                log.error("Failed to convert whole map to List<ItemDto>: {}", e.getMessage());
                throw new RpcException(500, "Response is an object but not in expected format. Keys: " + responseMap.keySet());
            }
        }

        // Convert response to List<ItemDto> (original logic for direct array response)
        try {
            List<ItemDto> itemList = objectMapper.convertValue(response, new TypeReference<List<ItemDto>>() {});
            log.info("Successfully converted direct response to item list with {} items", itemList.size());
            return itemList;
        } catch (Exception e) {
            log.error("Failed to convert response to List<ItemDto>: {}", e.getMessage());
            log.error("Response class: {}", response.getClass().getName());
            log.error("Response content: {}", response);
            throw new RpcException(500, "Failed to parse response: " + e.getMessage());
        }
    }

    // Function để lấy SalesOrder theo soId
    public SalesOrderDto getSalesOrderById(Long soId) {
        log.info("Getting SalesOrder by ID: {}", soId);
        
        GenericEvent event = new GenericEvent();
        event.setPattern("sales_order.get_by_id");
        
        Map<String, Object> data = Map.of("soId", soId);
        event.setData(data);
        
        Object response = rabbitTemplate.convertSendAndReceive(EventConstants.BUSINESS_SERVICE_QUEUE, event);

        if (response == null) {
            throw new RpcException(504, "No reply or timeout from business service");
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

        // if it's a Map/LinkedHashMap, convert to SalesOrderDto
        if (response instanceof Map) {
            SalesOrderDto dto = objectMapper.convertValue(response, SalesOrderDto.class);
            log.info("Converted Map to SalesOrderDto: {}", dto);
            return dto;
        }

        throw new RpcException(500, "Unexpected response type: " + response.getClass());
    }

    public List<SalesOrderDto> getAllSalesOrdersByCompanyId(Long companyId) {
        log.info("Getting SalesOrders by Company ID: {}", companyId);

        GenericEvent event = new GenericEvent();
        event.setPattern("sales_order.get_all_by_company_id");

        Map<String, Object> data = Map.of("companyId", companyId);
        event.setData(data);

        Object response = rabbitTemplate.convertSendAndReceive(EventConstants.BUSINESS_SERVICE_QUEUE, event);

        if (response == null) {
            throw new RpcException(504, "No reply or timeout from business service");
        }

        if (response instanceof ErrorResponse) {
            ErrorResponse error = (ErrorResponse) response;
            log.error("Error getting SalesOrder list: {}", error.getMessage());
            throw new RpcException(error.getStatusCode(), error.getMessage());
        }

        // Check if response is a Map (could be wrapped response or error)
        if (response instanceof Map) {
            Map<String, Object> responseMap = (Map<String, Object>) response;
            log.info("SalesOrder response is a Map with keys: {}", responseMap.keySet());
            
            // Check if it's an error response (has statusCode and message keys)
            if (responseMap.containsKey("statusCode") && responseMap.containsKey("message")) {
                Integer statusCode = (Integer) responseMap.get("statusCode");
                String message = (String) responseMap.get("message");
                log.error("Received error response from business service: {} - {}", statusCode, message);
                throw new RpcException(statusCode, message);
            }
            
            // Check if there's a 'data' field containing the actual list
            if (responseMap.containsKey("data")) {
                Object dataField = responseMap.get("data");
                try {
                    List<SalesOrderDto> soList = objectMapper.convertValue(dataField, new TypeReference<List<SalesOrderDto>>() {});
                    log.info("Successfully converted data field to SalesOrder list with {} items", soList.size());
                    return soList;
                } catch (Exception e) {
                    log.error("Failed to convert 'data' field to List<SalesOrderDto>: {}", e.getMessage());
                }
            }
        }

        // Convert response to List<SalesOrderDto> (original logic for direct array response)
        try {
            List<SalesOrderDto> soList = objectMapper.convertValue(response, new TypeReference<List<SalesOrderDto>>() {});
            log.info("Successfully converted direct response to SalesOrder list with {} items", soList.size());
            return soList;
        } catch (Exception e) {
            log.error("Failed to convert response to List<SalesOrderDto>: {}", e.getMessage());
            throw new RpcException(500, "Failed to parse response: " + e.getMessage());
        }
    }

    // Function to get ManufactureLine by id from general service
    public ManufactureLineDto getManufactureLineById(Long lineId) {
        log.info("Getting manufacture line by ID: {}", lineId);

        GenericEvent event = new GenericEvent();
        event.setPattern("manufacture_line.get_by_id");

        Map<String, Object> data = Map.of("lineId", lineId);
        event.setData(data);

        Object response = rabbitTemplate.convertSendAndReceive(EventConstants.GENERAL_SERVICE_QUEUE, event);

        if (response == null) {
            throw new RpcException(504, "No reply or timeout from general service");
        }

        if (response instanceof ManufactureLineDto) {
            ManufactureLineDto dto = (ManufactureLineDto) response;
            log.info("Received ManufactureLine data: {}", dto);
            return dto;
        }

        if (response instanceof ErrorResponse) {
            ErrorResponse error = (ErrorResponse) response;
            log.error("Error getting ManufactureLine: {}", error.getMessage());
            throw new RpcException(error.getStatusCode(), error.getMessage());
        }

        if (response instanceof Map) {
            ManufactureLineDto dto = objectMapper.convertValue(response, ManufactureLineDto.class);
            log.info("Converted Map to ManufactureLineDto: {}", dto);
            return dto;
        }

        throw new RpcException(500, "Unexpected response type: " + response.getClass());
    }
    public void publishProductBatchCreate(Long itemId, Integer quantity, String batchNo, Long moId) {
        log.info("Publishing product batch create event: itemId={}, quantity={}, batchNo={}", itemId, quantity, batchNo);
        
        GenericEvent event = new GenericEvent();
        event.setPattern("product.batch_create");
        
        Map<String, Object> data = new HashMap<>();
        data.put("itemId", itemId);
        data.put("quantity", quantity);
        data.put("batchNo", batchNo);
        data.put("moId", moId);
        event.setData(data);
        
        rabbitTemplate.convertAndSend(EventConstants.GENERAL_SERVICE_QUEUE, event);
    }

    public List<Map<String, Object>> createProductBatchSync(Long itemId, Integer quantity, String batchNo, Long moId) {
        log.info("Creating product batch SYNC: itemId={}, quantity={}, batchNo={}", itemId, quantity, batchNo);
        
        GenericEvent event = new GenericEvent();
        event.setPattern("product.batch_create");
        
        Map<String, Object> data = new HashMap<>();
        data.put("itemId", itemId);
        data.put("quantity", quantity);
        data.put("batchNo", batchNo);
        data.put("moId", moId);
        event.setData(data);
        
        Object response = rabbitTemplate.convertSendAndReceive(EventConstants.GENERAL_SERVICE_QUEUE, event);

        if (response == null) {
            log.error("No response from general-service");
            throw new RpcException(504, "Không nhận được phản hồi từ general service");
        }

        log.info("Response type: {}", response.getClass().getName());

        if (response instanceof ErrorResponse) {
            ErrorResponse error = (ErrorResponse) response;
            log.error("Error from general-service: {} - {}", error.getStatusCode(), error.getMessage());
            throw new RpcException(error.getStatusCode(), error.getMessage());
        }

        if (response instanceof Map) {
            Map<String, Object> responseMap = (Map<String, Object>) response;
            
            if (responseMap.containsKey("statusCode") && responseMap.containsKey("message")) {
                Integer statusCode = (Integer) responseMap.get("statusCode");
                String message = (String) responseMap.get("message");
                log.error("Error response: {} - {}", statusCode, message);
                throw new RpcException(statusCode, message);
            }
        }

        try {
            List<Map<String, Object>> products = objectMapper.convertValue(
                response, 
                new TypeReference<List<Map<String, Object>>>() {}
            );
            
            log.info("Successfully created {} products", products.size());
            return products;
            
        } catch (Exception e) {
            log.error("Failed to parse response: {}", e.getMessage());
            log.error("Response content: {}", response);
            throw new RpcException(500, "Lỗi parse response: " + e.getMessage());
        }
    }
}