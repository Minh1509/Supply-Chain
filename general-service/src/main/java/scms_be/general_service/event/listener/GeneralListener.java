package scms_be.general_service.event.listener;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import scms_be.general_service.exception.RpcException;
import scms_be.general_service.handler.ItemHandler;
import scms_be.general_service.handler.ManufactureLineHandler;
import scms_be.general_service.handler.ManufacturePlantHandler;
import scms_be.general_service.handler.ProductHandler;
import scms_be.general_service.model.ErrorResponse;
import scms_be.general_service.model.event.GenericEvent;

@Service
public class GeneralListener {

    @Autowired
    private ItemHandler itemHandler;

    @Autowired
    private ManufactureLineHandler lineHandler;

    @Autowired
    private ManufacturePlantHandler plantHandler;

    @Autowired
    private ProductHandler productHandler;

    @RabbitListener(queues = "general_queue")
    public Object handleEvents(GenericEvent event) {
        try {
            switch (event.getPattern()) {
                case "item.create":
                case "item.update":
                case "item.get_by_id":
                case "item.get_all_in_company":
                    return itemHandler.handle(event);

                case "manufacture_line.create":
                case "manufacture_line.update":
                case "manufacture_line.get_by_id":
                case "manufacture_line.get_all_in_plant":
                    return lineHandler.handle(event);

                case "product.create":
                case "product.update":
                case "product.get_by_id":
                case "product.get_all_in_company":
                    return productHandler.handle(event);

                case "manufacture_plant.create":
                case "manufacture_plant.update":
                case "manufacture_plant.get_by_id":
                case "manufacture_plant.get_all_in_company":
                    return plantHandler.handle(event);

                default:
                    throw new RpcException(400, "Unknown event: " + event.getPattern());
            }
        } catch (RpcException ex) {
            return new ErrorResponse(ex.getStatusCode(), ex.getMessage());
        } catch (Exception ex) {
            return new ErrorResponse(500, "Internal error: " + ex.getMessage());
        }
    }
}