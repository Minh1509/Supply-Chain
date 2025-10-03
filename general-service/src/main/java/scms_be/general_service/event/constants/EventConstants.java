package scms_be.general_service.event.constants;

public final class EventConstants {
    
    // Queue của service này (để lắng nghe)
    public static final String GENERAL_SERVICE_QUEUE = "general_queue";
    
    // Queue của notification service (để bắn email tới)
    public static final String NOTIFICATION_SERVICE_QUEUE = "notification_service.queue";

    private EventConstants() {
        // Prevent instantiation
    }
}