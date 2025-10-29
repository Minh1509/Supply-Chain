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
            case "manufacture.create":
                return manufactureOrderService.createOrder(request.getManuOrderData());
            case "manufacture.get_by_item_id":
                return manufactureOrderService.getAllManufactureOrdersbyItemId(request.getItemId());
            case "manufacture.get_all_in_company":
                return manufactureOrderService.getAllManufactureOrdersByCompanyId(request.getCompanyId());
            case "manufacture.get_by_id":
                return manufactureOrderService.getById(request.getMoId());
            case "manufacture.get_by_code":
                return manufactureOrderService.getByCode(request.getMoCode());
            case "manufacture.update":
                return manufactureOrderService.update(request.getMoId(), request.getManuOrderData());
            case "manufacture.manufacture_report":
                return manufactureOrderService.getManuReport(request.getManuReportRequest(), request.getCompanyId());
            case "manufacture.monthly_manufacture_report":
                return manufactureOrderService.getMonthlyManuReport(request.getCompanyId(), request.getType());
            default:
                throw new RpcException(400, "Unknown manufacture event: " + event.getPattern());
        }
    }
}
