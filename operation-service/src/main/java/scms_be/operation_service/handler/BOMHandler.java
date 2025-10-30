package scms_be.operation_service.handler;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import scms_be.operation_service.exception.RpcException;
import scms_be.operation_service.model.event.GenericEvent;
import scms_be.operation_service.model.request.BOMRequest;
import scms_be.operation_service.service.BOMService;

@Service
public class BOMHandler {

    @Autowired
    private BOMService bomService;
    @Autowired
    private ObjectMapper objectMapper;

    public Object handle(GenericEvent event) {
        BOMRequest request = objectMapper.convertValue(event.getData(), BOMRequest.class);
        System.out.println("event: " + event);
        
        try {
            switch (event.getPattern()) {
                case "bom.create":
                    return bomService.createBOM(request.getBom());
                case "bom.get_by_item_id":
                    return bomService.getBOMByItem(request.getItemId());
                case "bom.get_all_in_company":
                    return bomService.getAllBOMInCom(request.getCompanyId());
                case "bom.update":
                    return bomService.updateBOM(request.getBomId(), request.getBom());
                case "bom.delete":
                    bomService.deleteBOM(request.getBomId());
                    return "OK";
                default:
                    throw new RpcException(400, "Unknown BOM event: " + event.getPattern());
            }
        } catch (Exception e) {
            System.err.println("Error in BOMHandler: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}
