package scms_be.general_service.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import scms_be.general_service.exception.RpcException;
import scms_be.general_service.model.event.GenericEvent;
import scms_be.general_service.model.request.ProductRequest;
import scms_be.general_service.service.ProductService;

@Service
public class ProductHandler {

    @Autowired
    private ProductService productService;

    @Autowired
    private ObjectMapper objectMapper; // Jackson mapper

    public Object handle(GenericEvent event) {
        ProductRequest req = objectMapper.convertValue( event.getData(), ProductRequest.class );
        System.out.println("event: " + event + ", req: " + req);
        switch (event.getPattern()) {
            case "product.create":
                return productService.createProduct(req);
            case "product.update":
                return productService.updateProduct(req);
            case "product.get_by_id":
                return productService.getProductById(req);
            case "product.get_all_by_item":
                return productService.getAllProductsByItem(req);
            case "product.delete":
                return productService.deleteProduct(req);
            default:
                throw new RpcException(400, "Unknown product event: " + event.getPattern());
        }
    }
}
