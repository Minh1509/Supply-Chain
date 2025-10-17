package scms_be.inventory_service.model.event;
import lombok.Data;

@Data
public class GenericEvent {
    private String pattern;
    private Object data;
}
