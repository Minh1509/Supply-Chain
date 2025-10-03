package scms_be.general_service.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import scms_be.general_service.exception.RpcException;
import scms_be.general_service.model.event.GenericEvent;
import scms_be.general_service.model.request.ManufacturePlantRequest;
import scms_be.general_service.service.ManufacturePlantService;

@Service
public class ManufacturePlantHandler {

    @Autowired
    private ManufacturePlantService plantService;

    @Autowired
    private ObjectMapper objectMapper; // Jackson mapper

    public Object handle(GenericEvent event) {
        ManufacturePlantRequest req = objectMapper.convertValue(
                event.getData(), ManufacturePlantRequest.class
        );

        switch (event.getPattern()) {
            case "manufacture_plant.create":
                return plantService.createPlant(req);
            case "manufacture_plant.update":
                return plantService.updatePlant(req);
            case "manufacture_plant.get_by_id":
                return plantService.getPlantById(req);
            case "manufacture_plant.get_all_in_company":
                return plantService.getAllPlantsInCompany(req);
            default:
                throw new RpcException(400, "Unknown manufacture plant event: " + event.getPattern());
        }
    }
}
