export enum NodeEnv {
  Local = 'local',
  Development = 'development',
  Production = 'production',
}

export enum ChatIntent {
  // Query intents
  CHECK_INVENTORY = 'check_inventory',
  GET_ORDER_STATUS = 'get_order_status',
  VIEW_REPORT = 'view_report',
  FIND_SUPPLIER = 'find_supplier',
  FIND_ITEM = 'find_item',
  CHECK_WAREHOUSE = 'check_warehouse',

  // Action intents
  CREATE_PURCHASE_ORDER = 'create_purchase_order',
  CREATE_SALES_ORDER = 'create_sales_order',
  CREATE_RFQ = 'create_rfq',
  CREATE_QUOTATION = 'create_quotation',
  APPROVE_ORDER = 'approve_order',
  UPDATE_ORDER_STATUS = 'update_order_status',

  // General
  GREETING = 'greeting',
  HELP = 'help',
  GOODBYE = 'goodbye',
  UNKNOWN = 'unknown',
}

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

export enum ActionStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}
