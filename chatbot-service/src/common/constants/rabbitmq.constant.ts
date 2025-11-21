export const RABBITMQ_QUEUES = {
  INVENTORY: 'inventory_queue',
  BUSINESS: 'business_queue',
  OPERATION: 'operation_queue',
  GENERAL: 'general_queue',
  AUTH: 'auth_queue',
  CHATBOT: 'chatbot_queue',
};

export const RABBITMQ_PATTERNS = {
  INVENTORY: {
    GET_ALL: 'inventory.get_all_inventory',
    GET_BY_ID: 'inventory.get_by_id',
    CHECK: 'inventory.check',
    INCREASE: 'inventory.increase_quantity',
    DECREASE: 'inventory.decrease_quantity',
  },
  ISSUE_TICKET: {
    CREATE: 'issue_ticket.create',
    GET_ALL: 'issue_ticket.get_all_in_company',
    GET_BY_ID: 'issue_ticket.get_by_id',
    REPORT: 'issue_ticket.get_monthly_issue_report',
  },
  RECEIVE_TICKET: {
    CREATE: 'receive_ticket.create',
    GET_ALL: 'receive_ticket.get_all_in_company',
    GET_BY_ID: 'receive_ticket.get_by_id',
    REPORT: 'receive_ticket.get_monthly_report',
  },
  WAREHOUSE: {
    GET_ALL: 'warehouse.get_all_in_company',
    GET_BY_ID: 'warehouse.get_by_id',
  },
  SALES_ORDER: {
    CREATE: 'so.create',
    GET_BY_ID: 'so.get_by_id',
    GET_BY_CODE: 'so.get_by_code',
    GET_ALL: 'so.get_all_in_company',
    REPORT: 'so.monthly_report',
  },
  PURCHASE_ORDER: {
    CREATE: 'po.create',
    GET_BY_ID: 'po.get_by_id',
    GET_BY_CODE: 'po.get_by_code',
    GET_ALL: 'po.get_all_in_company',
    REPORT: 'po.monthly_report',
  },
  MANUFACTURE_ORDER: {
    CREATE: 'manufacture_order.create',
    GET_BY_ID: 'manufacture_order.get_by_id',
    GET_BY_CODE: 'manufacture_order.get_by_code',
    GET_ALL: 'manufacture_order.get_all_in_company',
    REPORT: 'manufacture_order.monthly_report',
  },
  ITEM: {
    GET_BY_ID: 'item.get_by_id',
    GET_ALL: 'item.get_all_in_company',
  },
  PRODUCT: {
    GET_BY_ID: 'product.get_by_id',
    GET_ALL: 'product.get_all_in_company',
  },
};
