package scms_be.general_service.model.event;

import lombok.Data;
import scms_be.general_service.model.request.ManufactureLineRequest;

@Data
public class ManufactureLineEvent {
    private String pattern;
    private ManufactureLineRequest data;
}