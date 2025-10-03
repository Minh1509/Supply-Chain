package scms_be.general_service.model.request;

import lombok.Data;

@Data
public class ManufactureLineRequest {
    private Long plantId;
    private Long lineId; // for get by id, update, delete
    private LineData line;
    
    @Data
    public static class LineData {
        private String lineName;
        private Double capacity;
        private String description;
    }
}