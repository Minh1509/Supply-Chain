package scms_be.operation_service.handler;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import scms_be.operation_service.exception.RpcException;
import scms_be.operation_service.model.event.GenericEvent;
import scms_be.operation_service.model.request.DeliveryOrderRequest;
import scms_be.operation_service.service.DeliveryOrderService;

@Service
public class DeliveryOrderHandler {

    @Autowired
    private DeliveryOrderService deliveryOrderService;

    @Autowired
    private ObjectMapper objectMapper;

    public Object handle(GenericEvent event) {
        try {
            System.out.println("DeliveryOrder raw event data: " + event.getData());
            DeliveryOrderRequest request = objectMapper.convertValue(event.getData(), DeliveryOrderRequest.class);
            System.out.println("DeliveryOrder converted request: " + request);
            System.out.println("DeliveryOrder data: " + request.getDeliveryOrderData());
            
            switch (event.getPattern()) {
                case "delivery_order.create": {
                    return deliveryOrderService.createDeliveryOrder(request.getDeliveryOrderData());
                }
            case "delivery_order.get_by_id": {
                return deliveryOrderService.getDoById(request.getDoId());
            }
            case "delivery_order.get_by_so": {
                return deliveryOrderService.getDoBySalesOrderId(request.getSoId());
            }
            case "delivery_order.get_all_in_company": {
                return deliveryOrderService.getAllInCompany(request.getCompanyId());
            }
            case "delivery_order.update": {
                return deliveryOrderService.updateDo(request.getDoId(), request.getDeliveryOrderData());
            }
            default:
                throw new RpcException(400, "Unknown delivery event: " + event.getPattern());
        }
        } catch (Exception e) {
            System.err.println("Error in DeliveryOrderHandler: " + e.getMessage());
            e.printStackTrace();
            throw new RpcException(500, "Internal error: " + e.getMessage());
        }
    }
}
