package scms_be.operation_service.model.event;
import lombok.Data;

@Data
public class GenericEvent {
    private String pattern;
    private Object data;
}
