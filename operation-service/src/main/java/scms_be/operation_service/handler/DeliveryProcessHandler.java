package scms_be.operation_service.handler;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

import scms_be.operation_service.exception.RpcException;
import scms_be.operation_service.model.event.GenericEvent;
import scms_be.operation_service.model.request.DeliveryProcessRequest;
import scms_be.operation_service.service.DeliveryProcessService;

@Service
public class DeliveryProcessHandler {

    @Autowired
    private DeliveryProcessService deliveryProcessService;

    @Autowired
    private ObjectMapper objectMapper;

    public Object handle(GenericEvent event) {
        DeliveryProcessRequest request = objectMapper.convertValue(event.getData(), DeliveryProcessRequest.class);
        System.out.println("delivery process event: " + event);
        switch (event.getPattern()) {
            case "delivery_process.create": {
                return deliveryProcessService.createDeliveryProcess(request.getDeliveryProcessData());
            }
            case "delivery_process.get_all_by_do": {
                return deliveryProcessService.getAllByDoId(request.getDoId());
            }
            case "delivery_process.update": {
                return deliveryProcessService.updateProcess(request.getDoId(), request.getDeliveryProcessData());
            }
            default:
                throw new RpcException(400, "Unknown delivery_process event: " + event.getPattern());
        }
    }
}
