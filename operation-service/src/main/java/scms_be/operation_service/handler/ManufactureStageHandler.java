package scms_be.operation_service.handler;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import scms_be.operation_service.exception.RpcException;
import scms_be.operation_service.model.event.GenericEvent;
import scms_be.operation_service.model.request.ManuStageRequest;
import scms_be.operation_service.service.ManufactureStageService;

@Service
public class ManufactureStageHandler {

    @Autowired
    private ManufactureStageService stageService;

    @Autowired
    private ObjectMapper objectMapper;

    public Object handle(GenericEvent event) {
        ManuStageRequest request = objectMapper.convertValue(event.getData(), ManuStageRequest.class);
        System.out.println("manufacture stage event: " + event);
        switch (event.getPattern()) {
            case "manufacture_stage.is_item_created_stage": 
                return stageService.isItemCreatedStage(request.getItemId());
            case "manufacture_stage.create": 
                return stageService.createStage(request.getManuStageData());
            case "manufacture_stage.get_by_item_id": 
                return stageService.getStagesByItemId(request.getItemId());
            case "manufacture_stage.get_by_id": 
                return stageService.getStageById(request.getStageId());
            case "manufacture_stage.get_all_in_company": 
                return stageService.getAllStagesInCompany(request.getCompanyId());      
            case "manufacture_stage.update": 
                return stageService.updateStage(request.getStageId(), request.getManuStageUpdateData());
            case "manufacture_stage.delete": 
                stageService.deleteStage(request.getStageId());
                return "OK";
            default:
                throw new RpcException(400, "Unknown manufacture_stage event: " + event.getPattern());
        }
    }
}
