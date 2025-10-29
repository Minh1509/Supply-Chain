package scms.business_service.event.constants;

public final class EventConstants {
    
    // Queue của các service khác
    public static final String AUTH_SERVICE_QUEUE = "auth_queue";
    public static final String GENERAL_SERVICE_QUEUE = "general_queue";
    
    // Company patterns (auth_service)
    public static final String COMPANY_FIND_ONE = "company.find-one";
    public static final String COMPANY_FIND_ALL = "company.find-all";
    
    // Item patterns (general_service)
    public static final String ITEM_GET_BY_ID = "item.get_by_id";
    public static final String ITEM_GET_ALL_IN_COMPANY = "item.get_all_in_company";
    
    private EventConstants() {
        // Prevent instantiation
    }
}
