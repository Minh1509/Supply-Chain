package scms_be.operation_service.event.publisher;

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

    private ObjectMapper objectMapper ;

    public ItemDto getItemById(Long itemId) {
        log.info("Getting item by ID: {}", itemId);
        
        // Tạo GenericEvent với pattern và data
        GenericEvent event = new GenericEvent();
        event.setPattern("item.get_by_id");
        
        // Tạo ItemRequest với itemId
        ItemRequest request = new ItemRequest();
        request.setItemId(itemId);
        event.setData(request);
        
        // Gửi và nhận response từ service khác
        Object response = rabbitTemplate.convertSendAndReceive(EventConstants.GENERAL_SERVICE_QUEUE, event);
        
        if (response instanceof ItemDto) {
            ItemDto itemDto = (ItemDto) response;
            log.info("Received item data: {}", itemDto);
            // Ở đây bạn có thể lưu dữ liệu vào database hoặc xử lý khác
            return itemDto;
        } else if (response instanceof ErrorResponse) {
            ErrorResponse error = (ErrorResponse) response;
            log.error("Error getting item: {}", error.getMessage());
            throw new RpcException(error.getStatusCode(), error.getMessage());
        }
        
        log.info("Get item by ID completed successfully");
        return null;
    }

    public List<ItemDto> GetItemAllByCompanyId(Long companyId) {
        log.info("Getting all items by Company ID: {}", companyId);

        GenericEvent event = new GenericEvent();
        event.setPattern("item.get_all_by_company_id");

        ItemRequest request = new ItemRequest();
        request.setCompanyId(companyId);
        event.setData(request);

        Object response = rabbitTemplate.convertSendAndReceive(EventConstants.GENERAL_SERVICE_QUEUE, event);

        if (response == null) {
            throw new RpcException(504, "No reply or timeout from general service");
        }

        if (response instanceof List) {
            List<ItemDto> itemList = objectMapper.convertValue(response, new TypeReference<List<ItemDto>>() {});
            log.info("Received item list: {}", itemList);
            return itemList;
        }

        if (response instanceof ErrorResponse) {
            ErrorResponse error = (ErrorResponse) response;
            log.error("Error getting item list: {}", error.getMessage());
            throw new RpcException(error.getStatusCode(), error.getMessage());
        }

        throw new RpcException(500, "Unexpected response type: " + response.getClass());
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

    public List<SalesOrderDto> getAllSalesOrdersByCompanyId(Long companyId) {
        log.info("Getting SalesOrders by Company ID: {}", companyId);

        GenericEvent event = new GenericEvent();
        event.setPattern("sales_order.get_all_by_company_id");

        Map<String, Object> data = Map.of("companyId", companyId);
        event.setData(data);

        Object response = rabbitTemplate.convertSendAndReceive(EventConstants.BUSINESS_SERVICE_QUEUE, event);

        if (response == null) {
            throw new RpcException(504, "No reply or timeout from operation service");
        }

        if (response instanceof List) {
            List<SalesOrderDto> soList = objectMapper.convertValue(response, new TypeReference<List<SalesOrderDto>>() {});
            log.info("Received SalesOrder list: {}", soList);
            return soList;
        }

        if (response instanceof ErrorResponse) {
            ErrorResponse error = (ErrorResponse) response;
            log.error("Error getting SalesOrder list: {}", error.getMessage());
            throw new RpcException(error.getStatusCode(), error.getMessage());
        }

        throw new RpcException(500, "Unexpected response type: " + response.getClass());
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
}