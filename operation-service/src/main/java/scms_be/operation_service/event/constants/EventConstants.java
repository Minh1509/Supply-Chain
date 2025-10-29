package scms_be.operation_service.event.constants;

public final class EventConstants {
    
    // Queue của inventory service
    public static final String INVENTORY_SERVICE_QUEUE = "inventory_queue";
    
     // Queue của general service
    public static final String GENERAL_SERVICE_QUEUE = "general_queue";

    // Queue của business service
    public static final String BUSINESS_SERVICE_QUEUE = "business_queue";

    private EventConstants() {
        // Prevent instantiation
    }
}