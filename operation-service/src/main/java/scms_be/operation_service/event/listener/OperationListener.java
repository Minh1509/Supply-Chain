package scms_be.operation_service.event.listener;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import scms_be.operation_service.exception.RpcException;
import scms_be.operation_service.handler.BOMHandler;
import scms_be.operation_service.handler.ManufactureOrderHandler;
import scms_be.operation_service.handler.ManufactureProcessHandler;
import scms_be.operation_service.handler.ManufactureStageHandler;
import scms_be.operation_service.handler.DeliveryOrderHandler;
import scms_be.operation_service.handler.DeliveryProcessHandler;
import scms_be.operation_service.model.ErrorResponse;
import scms_be.operation_service.model.event.GenericEvent;

@Service
public class OperationListener {

    @Autowired
    private BOMHandler bomHandler;

    @Autowired
    private ManufactureOrderHandler manufactureOrderHandler;

    @Autowired
    private ManufactureProcessHandler manufactureProcessHandler;

    @Autowired
    private ManufactureStageHandler manufactureStageHandler;

    @Autowired
    private DeliveryOrderHandler deliveryOrderHandler;

    @Autowired
    private DeliveryProcessHandler deliveryProcessHandler;

    @RabbitListener(queues = "operation_queue")
    public Object handleEvents(GenericEvent event) {
        try {
            switch (event.getPattern()) {
                // BOM handlers
                case "bom.create":
                case "bom.get_by_item_id":
                case "bom.get_all_in_company":
                case "bom.update":
                case "bom.delete":
                    return bomHandler.handle(event);
                // Manufacture order handlers
                case "manufacture_order.create":
                case "manufacture_order.get_all_by_item":
                case "manufacture_order.get_all_in_company":
                case "manufacture_order.get_by_id":
                case "manufacture_order.update":
                case "manufacture_order.report":
                case "manufacture_order.monthly_report":
                    return manufactureOrderHandler.handle(event);
                // Manufacture process handlers
                case "manufacture_process.create":
                case "manufacture_process.get_all_in_mo":
                case "manufacture_process.get_by_id":
                case "manufacture_process.update":
                    return manufactureProcessHandler.handle(event);
                // Manufacture stage handlers
                case "manufacture_stage.create":
                case "manufacture_stage.get_by_item_id":
                case "manufacture_stage.get_by_id":
                case "manufacture_stage.get_all_in_company":
                case "manufacture_stage.update":
                case "manufacture_stage.delete":
                    return manufactureStageHandler.handle(event);
                // Delivery handlers
                case "delivery_order.create":
                case "delivery_order.get_by_id":
                case "delivery_order.get_by_so":
                case "delivery_order.get_all_in_company":
                case "delivery_order.update":
                    return deliveryOrderHandler.handle(event);
                // Delivery process handlers
                case "delivery_process.create":
                case "delivery_process.get_all_by_do":
                case "delivery_process.update":
                    return deliveryProcessHandler.handle(event);
                default:
                    throw new RpcException(400, "Unknown event: " + event.getPattern());
            }
        } catch (RpcException ex) {
            return new ErrorResponse(ex.getStatusCode(), ex.getMessage());
        } catch (Exception ex) {
            return new ErrorResponse(500, "Internal error: " + ex.getMessage());
        }
    }
}