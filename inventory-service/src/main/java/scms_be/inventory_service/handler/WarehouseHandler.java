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
        System.out.println("event: " + event);
        switch (event.getPattern()) {
            case "warehouse.create":
                WarehouseRequest createReq = objectMapper.convertValue(event.getData(), WarehouseRequest.class);
                return warehouseService.createWarehouse(createReq.getCompanyId(), createReq.getWarehouse());
            case "warehouse.update":
                WarehouseRequest updateReq = objectMapper.convertValue(event.getData(), WarehouseRequest.class);
                return warehouseService.updateWarehouse(updateReq.getWarehouseId(), updateReq.getWarehouse());
            case "warehouse.get_by_id":
                WarehouseRequest getByIdReq = objectMapper.convertValue(event.getData(), WarehouseRequest.class);
                return warehouseService.getWarehouseById(getByIdReq.getWarehouseId());
            case "warehouse.get_all_in_company":
                WarehouseRequest getAllReq = objectMapper.convertValue(event.getData(), WarehouseRequest.class);
                return warehouseService.getAllWarehousesInCompany(getAllReq.getCompanyId());
            case "warehouse.delete":
                WarehouseRequest deleteReq = objectMapper.convertValue(event.getData(), WarehouseRequest.class);
                return warehouseService.deleteWarehouse(deleteReq.getWarehouseId());
            default:
                throw new RpcException(400, "Unknown warehouse event: " + event.getPattern());
        }
    }
}