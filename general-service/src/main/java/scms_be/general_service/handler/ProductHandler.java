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
            case "product.get_by_id":
                return productService.getProductById(req.getProductId());
            case "product.get_by_batch":
                return productService.getProductsByBatchNo(req.getBatchNo());
            case "product.scan_detail":
                return productService.scanQRCodeDetail(req.getQrCode());
            case "product.batch_create":
                return productService.batchCreateProducts(
                    req.getItemId(), 
                    req.getQuantity(), 
                    req.getBatchNo(),
                    req.getMoId()
                );
            case "product.generate_batch_qr_pdf":
                return productService.generateBatchQRCodesPDF(req.getBatchNo());
            case "product.update_batch_status":
                productService.updateBatchStatus(req.getBatchNo(), req.getNewStatus());
                return "Success";
            default:
                throw new RpcException(400, "Unknown product event: " + event.getPattern());
        }
    }
}
