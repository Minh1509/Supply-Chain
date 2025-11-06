export const APP_DEFAULTS = {
  APP_NAME: 'chatbot-service',
  APP_PORT: 3006,
};

export const RABBITMQ_CONSTANTS = {
  CHATBOT: {
    name: 'CHATBOT_SERVICE',
    queue: 'chatbot_queue',
  },
  AUTH: {
    name: 'AUTH_SERVICE',
    queue: 'auth_queue',
  },
  BUSINESS: {
    name: 'BUSINESS_SERVICE',
    queue: 'business_queue',
  },
  GENERAL: {
    name: 'GENERAL_SERVICE',
    queue: 'general_queue',
  },
  INVENTORY: {
    name: 'INVENTORY_SERVICE',
    queue: 'inventory_queue',
  },
  OPERATION: {
    name: 'OPERATION_SERVICE',
    queue: 'operation_queue',
  },
};

export const CHAT_CONSTANTS = {
  // WebSocket events
  EVENTS: {
    MESSAGE: 'message',
    TYPING: 'typing',
    ERROR: 'error',
    CONNECTED: 'connected',
    DISCONNECTED: 'disconnected',
    GET_HISTORY: 'get_history',
    CLEAR_HISTORY: 'clear_history',
  },

  // Message patterns
  PATTERNS: {
    PROCESS_MESSAGE: 'chat.process_message',
    GET_HISTORY: 'chat.get_history',
    CLEAR_HISTORY: 'chat.clear_history',
  },
};

export const REDIS_KEYS = {
  CONVERSATION_HISTORY: (sessionId: string) => `chat:history:${sessionId}`,
  USER_CONTEXT: (userId: string) => `chat:context:${userId}`,
  SESSION_DATA: (sessionId: string) => `chat:session:${sessionId}`,
};

export const SYSTEM_PROMPTS = {
  MAIN: `Bạn là trợ lý AI thông minh cho hệ thống quản lý chuỗi cung ứng.
Bạn hỗ trợ người dùng:
- Kiểm tra tồn kho
- Tạo và quản lý đơn mua hàng (PO)
- Tạo và quản lý đơn bán hàng (SO)
- Quản lý yêu cầu báo giá (RFQ) và báo giá
- Xem báo cáo và phân tích
- Quản lý kho hàng, mặt hàng và sản phẩm
- Quản lý lệnh sản xuất và quy trình
- Theo dõi đơn giao hàng

Luôn hữu ích, chuyên nghiệp và ngắn gọn. Khi thực hiện hành động, hãy xác nhận với người dùng trước.
Sử dụng tiếng Việt khi người dùng nói tiếng Việt, ngược lại dùng tiếng Anh.`,

  INTENT_RECOGNITION: `Phân tích tin nhắn người dùng và xác định intent. Trả về JSON:
{
  "intent": "intent_name",
  "confidence": 0.9,
  "entities": {
    "entity_name": "value"
  }
}

Các intent có sẵn:
- "inventory.check": Kiểm tra tồn kho, trạng thái kho
- "order.create": Tạo đơn mua, đơn bán, lệnh sản xuất
- "order.view": Xem chi tiết, trạng thái, lịch sử đơn
- "order.update": Cập nhật trạng thái, hủy đơn
- "report.generate": Tạo báo cáo, phân tích, thống kê
- "warehouse.list": Liệt kê kho, vị trí
- "supplier.list": Liệt kê nhà cung cấp, thông tin nhà cung cấp
- "item.search": Tìm kiếm mặt hàng, sản phẩm, vật liệu
- "rfq.create": Tạo yêu cầu báo giá
- "quotation.create": Tạo báo giá
- "delivery.track": Theo dõi trạng thái giao hàng
- "general.chat": Trò chuyện chung, chào hỏi, trợ giúp

Ngưỡng tin cậy: 0.7
Trả về "general.chat" nếu confidence < 0.7`,
};
