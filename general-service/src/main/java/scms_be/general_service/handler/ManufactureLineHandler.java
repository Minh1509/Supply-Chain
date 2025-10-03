package scms_be.general_service.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import scms_be.general_service.exception.RpcException;
import scms_be.general_service.model.event.GenericEvent;
import scms_be.general_service.model.request.ManufactureLineRequest;
import scms_be.general_service.service.ManufactureLineService;

@Service
public class ManufactureLineHandler {

    @Autowired
    private ManufactureLineService lineService;

    @Autowired
    private ObjectMapper objectMapper; // Jackson mapper

    public Object handle(GenericEvent event) {
        ManufactureLineRequest req = objectMapper.convertValue(
                event.getData(), ManufactureLineRequest.class
        );

        switch (event.getPattern()) {
            case "manufacture_line.create":
                return lineService.createLine(req);
            case "manufacture_line.update":
                return lineService.updateLine(req);
            case "manufacture_line.get_by_id":
                return lineService.getLineById(req);
            case "manufacture_line.get_all_in_plant":
                return lineService.getAllLinesInPlant(req);
            default:
                throw new RpcException(400, "Unknown manufacture line event: " + event.getPattern());
        }
    }
}
