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
        InventoryRequest request = objectMapper.convertValue(event.getData(), InventoryRequest.class);
        System.out.println("event: " + event);
        switch (event.getPattern()) {
            case "inventory.create":
                return inventoryService.createInventory(request.getInventory());
            case "inventory.update":
                return inventoryService.updateInventory(request.getInventoryId(), request.getInventory());
            case "inventory.get_by_id":
                return inventoryService.getInventoryById(request.getInventoryId());
            case "inventory.check":
                return inventoryService.checkInventory(request.getItemId(), 
                    request.getWarehouseId(), request.getAmount());
            case "inventory.increase_quantity":
                return inventoryService.increaseQuantity(request.getInventory());
            case "inventory.decrease_quantity":
                return inventoryService.decreaseQuantity(request.getInventory());
            case "inventory.increase_ondemand":
                return inventoryService.increaseOnDemand(request.getInventory());
            case "inventory.decrease_ondemand":
                return inventoryService.decreaseOnDemand(request.getInventory());
            case "inventory.get_all_inventory":
                return inventoryService.getInventoryByItemAndWarehouse(request.getCompanyId(), 
                    request.getItemId(), request.getWarehouseId());
            default:
                throw new RpcException(400, "Unknown inventory event: " + event.getPattern());
        }
    }
}
