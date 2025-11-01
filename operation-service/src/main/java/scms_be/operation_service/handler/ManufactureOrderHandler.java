package scms_be.operation_service.handler;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import scms_be.operation_service.exception.RpcException;
import scms_be.operation_service.model.event.GenericEvent;
import scms_be.operation_service.model.request.ManuOrderRequest;
import scms_be.operation_service.service.ManufactureOrderService;

@Service
public class ManufactureOrderHandler {

    @Autowired
    private ManufactureOrderService manufactureOrderService;

    @Autowired
    private ObjectMapper objectMapper;

    public Object handle(GenericEvent event) {
        ManuOrderRequest request = objectMapper.convertValue(event.getData(), ManuOrderRequest.class);
        System.out.println("manufacture event: " + event);
        switch (event.getPattern()) {
            case "manufacture_order.create":
                return manufactureOrderService.createOrder(request.getManuOrderData());
            case "manufacture_order.get_all_by_item":
                return manufactureOrderService.getAllManufactureOrdersbyItemId(request.getItemId());
            case "manufacture_order.get_all_in_company":
                return manufactureOrderService.getAllManufactureOrdersByCompanyId(request.getCompanyId());
            case "manufacture_order.get_by_id":
                return manufactureOrderService.getById(request.getMoId());
            case "manufacture_order.get_by_code":
                return manufactureOrderService.getByCode(request.getMoCode());
            case "manufacture_order.update":
                return manufactureOrderService.update(request.getMoId(), request.getManuOrderData());
            case "manufacture_order.report":
                return manufactureOrderService.getManuReport(request.getManuReportRequest(), request.getCompanyId());
            case "manufacture_order.monthly_report":
                return manufactureOrderService.getMonthlyManuReport(request.getCompanyId(), request.getType());
            default:
                throw new RpcException(400, "Unknown manufacture event: " + event.getPattern());
        }
    }
}
