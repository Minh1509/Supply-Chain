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
        try {
            ManuProcessRequest request = objectMapper.convertValue(event.getData(), ManuProcessRequest.class);
            
            switch (event.getPattern()) {
                case "manufacture_process.create":
                    if (request.getManuProcess() == null) {
                        throw new RpcException(400, "ManuProcess data is null");
                    }
                    return processService.createManuProcess(request.getManuProcess());
                case "manufacture_process.get_all_in_mo":
                    return processService.getAllByMoId(request.getMoId());
                case "manufacture_process.get_by_id":
                    return processService.getById(request.getProcessId());
                case "manufacture_process.update":
                    return processService.update(request.getProcessId(), request.getManuProcess());
                default:
                    throw new RpcException(400, "Unknown manufacture_process event: " + event.getPattern());
            }
        } catch (Exception e) {
            System.err.println("Error in ManufactureProcessHandler: " + e.getMessage());
            e.printStackTrace();
            throw new RpcException(500, "Internal error: " + e.getMessage());
        }
    }
}
