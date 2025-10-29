package scms.business_service.model.event;

import lombok.Data;

@Data
public class BusinessEvent {
    private String pattern;
    private Object data;
}
