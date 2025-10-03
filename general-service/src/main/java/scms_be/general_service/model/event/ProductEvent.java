package scms_be.general_service.model.event;

import lombok.Data;
import scms_be.general_service.model.request.ProductRequest;

@Data
public class ProductEvent {
    private String pattern;
    private ProductRequest data;
}