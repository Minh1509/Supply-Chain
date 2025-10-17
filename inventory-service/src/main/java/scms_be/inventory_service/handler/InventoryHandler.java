package scms_be.inventory_service.handler;

import com.fasterxml.jackson.databind.ObjectMapper;

import scms_be.inventory_service.exception.RpcException;
import scms_be.inventory_service.model.event.GenericEvent;
import scms_be.inventory_service.model.request.InventoryRequest;
import scms_be.inventory_service.service.InventoryService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class InventoryHandler {

    @Autowired
    private InventoryService inventoryService;
    @Autowired
    private ObjectMapper objectMapper;

    public Object handle(GenericEvent event) {
        System.out.println("event: " + event);
        switch (event.getPattern()) {
            case "inventory.create":
                InventoryRequest createReq = objectMapper.convertValue(event.getData(), InventoryRequest.class);
                return inventoryService.createInventory(createReq.getInventory());
            case "inventory.update":
                InventoryRequest updateReq = objectMapper.convertValue(event.getData(), InventoryRequest.class);
                return inventoryService.updateInventory(updateReq.getInventoryId(), updateReq.getInventory());
            case "inventory.get_by_id":
                InventoryRequest getByIdReq = objectMapper.convertValue(event.getData(), InventoryRequest.class);
                return inventoryService.getInventoryById(getByIdReq.getInventoryId());
            case "inventory.check":
                InventoryRequest checkReq = objectMapper.convertValue(event.getData(), InventoryRequest.class);
                return inventoryService.checkInventory(checkReq.getItemId(), 
                    checkReq.getWarehouseId(), checkReq.getAmount());
            case "inventory.increase_quantity":
                InventoryRequest increaseReq = objectMapper.convertValue(event.getData(), InventoryRequest.class);
                return inventoryService.increaseQuantity(increaseReq.getInventory());
            case "inventory.decrease_quantity":
                InventoryRequest decreaseReq = objectMapper.convertValue(event.getData(), InventoryRequest.class);
                return inventoryService.decreaseQuantity(decreaseReq.getInventory());
            case "inventory.increase_ondemand":
                InventoryRequest increaseOnDemandReq = objectMapper.convertValue(event.getData(), InventoryRequest.class);
                return inventoryService.increaseOnDemand(increaseOnDemandReq.getInventory());
            case "inventory.decrease_ondemand":
                InventoryRequest decreaseOnDemandReq = objectMapper.convertValue(event.getData(), InventoryRequest.class);
                return inventoryService.decreaseOnDemand(decreaseOnDemandReq.getInventory());
            case "inventory.get_by_item_and_warehouse":
                InventoryRequest getAllReq = objectMapper.convertValue(event.getData(), InventoryRequest.class);
                return inventoryService.getInventoryByItemAndWarehouse(getAllReq.getCompanyId(), 
                    getAllReq.getItemId(), getAllReq.getWarehouseId());
            default:
                throw new RpcException(400, "Unknown inventory event: " + event.getPattern());
        }
    }
}
