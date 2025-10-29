package scms_be.operation_service.handler;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import scms_be.operation_service.exception.RpcException;
import scms_be.operation_service.model.event.GenericEvent;
import scms_be.operation_service.model.request.ManuProcessRequest;
import scms_be.operation_service.service.ManufactureProcessService;

@Service
public class ManufactureProcessHandler {

    @Autowired
    private ManufactureProcessService processService;

    @Autowired
    private ObjectMapper objectMapper;

    public Object handle(GenericEvent event) {
        ManuProcessRequest request = objectMapper.convertValue(event.getData(), ManuProcessRequest.class);
        System.out.println("manufacture process event: " + event);
        switch (event.getPattern()) {
            case "manufacture_process.create":
                return processService.createManuProcess(request.getProcess());
            case "manufacture_process.get_all_in_mo":
                return processService.getAllByMoId(request.getMoId());
            case "manufacture_process.get_by_id":
                return processService.getById(request.getProcessId());
            case "manufacture_process.update":
                return processService.update(request.getProcessId(), request.getProcess());
            default:
                throw new RpcException(400, "Unknown manufacture_process event: " + event.getPattern());
        }
    }
}
