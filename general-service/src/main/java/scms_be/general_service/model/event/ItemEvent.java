package scms_be.general_service.model.event;

import lombok.Data;
import scms_be.general_service.model.request.ItemRequest;

@Data
public class ItemEvent {
    private String pattern;
    private ItemRequest data;
}