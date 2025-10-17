package scms_be.inventory_service.event.constants;

public final class EventConstants {
    
    // Queue của service này (để lắng nghe)
    public static final String INVENTORY_SERVICE_QUEUE = "inventory_service";
    
    // Queue của notification service (để bắn email tới)
    public static final String NOTIFICATION_SERVICE_QUEUE = "notification_service";

     // Queue của item service (để lấy thông tin hàng hóa)
    public static final String GENERAL_SERVICE_QUEUE = "general_service";

     // Queue của 
    public static final String OPERATION_SERVICE_QUEUE = "operation_service";

    private EventConstants() {
        // Prevent instantiation
    }
}