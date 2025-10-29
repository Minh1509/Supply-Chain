package scms_be.inventory_service.event.constants;

public final class EventConstants {

    // Queue của general service (để lấy thông tin hàng hóa)
    public static final String GENERAL_SERVICE_QUEUE = "general_queue";

    // Queue của operation service
    public static final String OPERATION_SERVICE_QUEUE = "operation_queue";

    // Queue của business service
    public static final String BUSINESS_SERVICE_QUEUE = "business_queue";


    private EventConstants() {
        // Prevent instantiation
    }
}