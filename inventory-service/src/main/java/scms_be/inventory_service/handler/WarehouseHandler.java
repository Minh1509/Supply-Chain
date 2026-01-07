package scms_be.inventory_service.handler;

import com.fasterxml.jackson.databind.ObjectMapper;

import scms_be.inventory_service.exception.RpcException;
import scms_be.inventory_service.model.event.GenericEvent;
import scms_be.inventory_service.model.request.WarehouseRequest;
import scms_be.inventory_service.service.WarehouseService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class WarehouseHandler {

    @Autowired
    private WarehouseService warehouseService;
    @Autowired
    private ObjectMapper objectMapper;

    public Object handle(GenericEvent event) {
        WarehouseRequest request = objectMapper.convertValue(event.getData(), WarehouseRequest.class);
        System.out.println("event: " + event);
        switch (event.getPattern()) {
            case "warehouse.create":
                return warehouseService.createWarehouse(request.getCompanyId(), request.getWarehouse());
            case "warehouse.update":
                return warehouseService.updateWarehouse(request.getWarehouseId(), request.getWarehouse());
            case "warehouse.get_by_id":
                return warehouseService.getWarehouseById(request.getWarehouseId());
            case "warehouse.get_all_in_company":
                return warehouseService.getAllWarehousesInCompany(request.getCompanyId());
            default:
                throw new RpcException(400, "Unknown warehouse event: " + event.getPattern());
        }
    }
}