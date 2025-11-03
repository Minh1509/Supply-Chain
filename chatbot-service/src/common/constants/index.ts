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
  MAIN: `You are an AI assistant for a Supply Chain Management System. 
You help users with:
- Checking inventory levels
- Creating and managing purchase orders (PO)
- Creating and managing sales orders (SO)
- Managing RFQ (Request for Quotation) and Quotations
- Viewing reports and analytics
- Managing warehouses, items, and products
- Managing manufacturing orders and processes
- Tracking delivery orders

Always be helpful, professional, and concise. When performing actions, confirm with the user first.
Use Vietnamese language when user speaks Vietnamese, otherwise use English.`,

  INTENT_RECOGNITION: `Analyze the user message and identify the intent. Return JSON format:
{
  "intent": "intent_name",
  "confidence": 0.9,
  "entities": {
    "entity_name": "value"
  }
}`,
};
