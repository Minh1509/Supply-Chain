package scms_be.general_service.model.request;

import lombok.Data;

@Data
public class ManufacturePlantRequest {
    private Long companyId;
    private Long plantId; // for get by id, update, delete
    private PlantData plant;
    
    @Data
    public static class PlantData {
        private String plantName;
        private String description;
    }
}