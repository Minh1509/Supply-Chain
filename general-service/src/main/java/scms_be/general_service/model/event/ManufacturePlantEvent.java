package scms_be.general_service.model.event;

import lombok.Data;
import scms_be.general_service.model.request.ManufacturePlantRequest;

@Data
public class ManufacturePlantEvent {
    private String pattern;
    private ManufacturePlantRequest data;
}