package scms_be.general_service.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import scms_be.general_service.exception.RpcException;
import scms_be.general_service.model.event.GenericEvent;
import scms_be.general_service.model.request.ItemRequest;
import scms_be.general_service.service.ItemService;

@Service
public class ItemHandler {

    @Autowired
    private ItemService itemService;
    @Autowired
    private ObjectMapper objectMapper;

    public Object handle(GenericEvent event) {
        ItemRequest req = objectMapper.convertValue(event.getData(), ItemRequest.class);
        System.out.println("event: " + event + ", req: " + req);
        switch (event.getPattern()) {
            case "item.create":
                return itemService.createItem(req);
            case "item.update":
                return itemService.updateItem(req);
            case "item.get_by_id":
                return itemService.getItemById(req);
            case "item.get_all_in_company":
                return itemService.getAllItemsInCompany(req);
            default:
                throw new RpcException(400, "Unknown item event: " + event.getPattern());
        }
    }
}
