package scms_be.inventory_service.event.publisher;

import scms_be.inventory_service.event.constants.EventConstants;
import scms_be.inventory_service.exception.RpcException;
import scms_be.inventory_service.model.ErrorResponse;
import scms_be.inventory_service.model.dto.publisher.ItemDto;
import scms_be.inventory_service.model.dto.publisher.BOMDto;
import scms_be.inventory_service.model.dto.publisher.ManufactureOrderDto;
import scms_be.inventory_service.model.dto.publisher.PurchaseOrderDto;
import scms_be.inventory_service.model.dto.publisher.SalesOrderDto;
import scms_be.inventory_service.model.event.GenericEvent;
import scms_be.inventory_service.model.request.ItemRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class EventPublisher {
    
    private final RabbitTemplate rabbitTemplate;

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
        Object response = rabbitTemplate.convertSendAndReceive(EventConstants.OPERATION_SERVICE_QUEUE, event);
        
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

    // Function để lấy BOM theo itemId
    public BOMDto getBOMByItemId(Long itemId) {
        log.info("Getting BOM by item ID: {}", itemId);
        
        GenericEvent event = new GenericEvent();
        event.setPattern("bom.get_by_item_id");
        
        Map<String, Object> data = Map.of("itemId", itemId);
        event.setData(data);
        
        Object response = rabbitTemplate.convertSendAndReceive(EventConstants.OPERATION_SERVICE_QUEUE, event);
        
        if (response instanceof BOMDto) {
            BOMDto bomDto = (BOMDto) response;
            log.info("Received BOM data: {}", bomDto);
            return bomDto;
        } else if (response instanceof ErrorResponse) {
            ErrorResponse error = (ErrorResponse) response;
            log.error("Error getting BOM: {}", error.getMessage());
            throw new RpcException(error.getStatusCode(), error.getMessage());
        }
        
        log.info("Get BOM by item ID completed successfully");
        return null;
    }

    // Function để lấy ManufactureOrder theo moCode
    public ManufactureOrderDto getManufactureOrderByCode(String moCode) {
        log.info("Getting ManufactureOrder by code: {}", moCode);
        
        GenericEvent event = new GenericEvent();
        event.setPattern("manufacture_order.get_by_code");
        
        Map<String, Object> data = Map.of("moCode", moCode);
        event.setData(data);
        
        Object response = rabbitTemplate.convertSendAndReceive(EventConstants.OPERATION_SERVICE_QUEUE, event);
        
        if (response instanceof ManufactureOrderDto) {
            ManufactureOrderDto moDto = (ManufactureOrderDto) response;
            log.info("Received ManufactureOrder data: {}", moDto);
            return moDto;
        } else if (response instanceof ErrorResponse) {
            ErrorResponse error = (ErrorResponse) response;
            log.error("Error getting ManufactureOrder: {}", error.getMessage());
            throw new RpcException(error.getStatusCode(), error.getMessage());
        }
        
        log.info("Get ManufactureOrder by code completed successfully");
        return null;
    }

    // Function để lấy ManufactureOrder theo moId
    public ManufactureOrderDto getManufactureOrderById(Long moId) {
        log.info("Getting ManufactureOrder by ID: {}", moId);
        
        GenericEvent event = new GenericEvent();
        event.setPattern("manufacture_order.get_by_id");
        
        Map<String, Object> data = Map.of("moId", moId);
        event.setData(data);
        
        Object response = rabbitTemplate.convertSendAndReceive(EventConstants.OPERATION_SERVICE_QUEUE, event);
        
        if (response instanceof ManufactureOrderDto) {
            ManufactureOrderDto moDto = (ManufactureOrderDto) response;
            log.info("Received ManufactureOrder data: {}", moDto);
            return moDto;
        } else if (response instanceof ErrorResponse) {
            ErrorResponse error = (ErrorResponse) response;
            log.error("Error getting ManufactureOrder: {}", error.getMessage());
            throw new RpcException(error.getStatusCode(), error.getMessage());
        }
        
        log.info("Get ManufactureOrder by ID completed successfully");
        return null;
    }

    // Function để lấy SalesOrder theo soCode
    public SalesOrderDto getSalesOrderByCode(String soCode) {
        log.info("Getting SalesOrder by code: {}", soCode);
        
        GenericEvent event = new GenericEvent();
        event.setPattern("sales_order.get_by_code");
        
        Map<String, Object> data = Map.of("soCode", soCode);
        event.setData(data);
        
        Object response = rabbitTemplate.convertSendAndReceive(EventConstants.OPERATION_SERVICE_QUEUE, event);
        
        if (response instanceof SalesOrderDto) {
            SalesOrderDto soDto = (SalesOrderDto) response;
            log.info("Received SalesOrder data: {}", soDto);
            return soDto;
        } else if (response instanceof ErrorResponse) {
            ErrorResponse error = (ErrorResponse) response;
            log.error("Error getting SalesOrder: {}", error.getMessage());
            throw new RpcException(error.getStatusCode(), error.getMessage());
        }
        
        log.info("Get SalesOrder by code completed successfully");
        return null;
    }

    // Function để lấy SalesOrder theo soId
    public SalesOrderDto getSalesOrderById(Long soId) {
        log.info("Getting SalesOrder by ID: {}", soId);
        
        GenericEvent event = new GenericEvent();
        event.setPattern("sales_order.get_by_id");
        
        Map<String, Object> data = Map.of("soId", soId);
        event.setData(data);
        
        Object response = rabbitTemplate.convertSendAndReceive(EventConstants.OPERATION_SERVICE_QUEUE, event);
        
        if (response instanceof SalesOrderDto) {
            SalesOrderDto soDto = (SalesOrderDto) response;
            log.info("Received SalesOrder data: {}", soDto);
            return soDto;
        } else if (response instanceof ErrorResponse) {
            ErrorResponse error = (ErrorResponse) response;
            log.error("Error getting SalesOrder: {}", error.getMessage());
            throw new RpcException(error.getStatusCode(), error.getMessage());
        }
        
        log.info("Get SalesOrder by ID completed successfully");
        return null;
    }

    // Function để lấy PurchaseOrder theo poCode
    public PurchaseOrderDto getPurchaseOrderByCode(String poCode) {
        log.info("Getting PurchaseOrder by code: {}", poCode);
        
        GenericEvent event = new GenericEvent();
        event.setPattern("purchase_order.get_by_code");
        
        Map<String, Object> data = Map.of("poCode", poCode);
        event.setData(data);
        
        Object response = rabbitTemplate.convertSendAndReceive(EventConstants.OPERATION_SERVICE_QUEUE, event);
        
        if (response instanceof PurchaseOrderDto) {
            PurchaseOrderDto poDto = (PurchaseOrderDto) response;
            log.info("Received PurchaseOrder data: {}", poDto);
            return poDto;
        } else if (response instanceof ErrorResponse) {
            ErrorResponse error = (ErrorResponse) response;
            log.error("Error getting PurchaseOrder: {}", error.getMessage());
            throw new RpcException(error.getStatusCode(), error.getMessage());
        }
        
        log.info("Get PurchaseOrder by code completed successfully");
        return null;
    }

    // Function để lấy PurchaseOrder theo poId
    public PurchaseOrderDto getPurchaseOrderById(Long poId) {
        log.info("Getting PurchaseOrder by ID: {}", poId);
        
        GenericEvent event = new GenericEvent();
        event.setPattern("purchase_order.get_by_id");
        
        Map<String, Object> data = Map.of("poId", poId);
        event.setData(data);
        
        Object response = rabbitTemplate.convertSendAndReceive(EventConstants.OPERATION_SERVICE_QUEUE, event);
        
        if (response instanceof PurchaseOrderDto) {
            PurchaseOrderDto poDto = (PurchaseOrderDto) response;
            log.info("Received PurchaseOrder data: {}", poDto);
            return poDto;
        } else if (response instanceof ErrorResponse) {
            ErrorResponse error = (ErrorResponse) response;
            log.error("Error getting PurchaseOrder: {}", error.getMessage());
            throw new RpcException(error.getStatusCode(), error.getMessage());
        }
        
        log.info("Get PurchaseOrder by ID completed successfully");
        return null;
    }
}