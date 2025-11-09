export const RABBITMQ_PATTERNS = {
  BUSINESS: {
    PO: {
      CREATE: 'po.create',
      GET_BY_ID: 'po.get_by_id',
      GET_BY_CODE: 'po.get_by_code',
      GET_ALL_IN_COMPANY: 'po.get_all_in_company',
      GET_ALL_BY_SUPPLIER: 'po.get_all_by_supplier',
      UPDATE_STATUS: 'po.update_status',
    },
    SO: {
      CREATE: 'so.create',
      GET_BY_ID: 'so.get_by_id',
      GET_BY_CODE: 'so.get_by_code',
      GET_ALL_IN_COMPANY: 'so.get_all_in_company',
      UPDATE_STATUS: 'so.update_status',
    },
    RFQ: {
      CREATE: 'rfq.create',
      GET_BY_ID: 'rfq.get_by_id',
      GET_ALL_IN_COMPANY: 'rfq.get_all_in_company',
      UPDATE_STATUS: 'rfq.update_status',
    },
    QUOTATION: {
      CREATE: 'quotation.create',
      GET_BY_ID: 'quotation.get_by_id',
      GET_BY_RFQ_ID: 'quotation.get_by_rfq_id',
      GET_ALL_IN_COMPANY: 'quotation.get_all_in_company',
      UPDATE_STATUS: 'quotation.update_status',
    },
  },
  INVENTORY: {
    INVENTORY: {
      CHECK: 'inventory.check',
      GET_BY_ID: 'inventory.get_by_id',
      CREATE: 'inventory.create',
      UPDATE: 'inventory.update',
    },
    WAREHOUSE: {
      GET_ALL_IN_COMPANY: 'warehouse.get_all_in_company',
      GET_BY_ID: 'warehouse.get_by_id',
      CREATE: 'warehouse.create',
      UPDATE: 'warehouse.update',
    },
  },
  GENERAL: {
    ITEM: {
      GET_BY_ID: 'item.get_by_id',
      GET_ALL_IN_COMPANY: 'item.get_all_in_company',
      CREATE: 'item.create',
      UPDATE: 'item.update',
    },
  },
  OPERATION: {
    MO: {
      GET_BY_ID: 'manufacture_order.get_by_id',
      GET_BY_CODE: 'manufacture_order.get_by_code',
      GET_ALL_IN_COMPANY: 'manufacture_order.get_all_in_company',
    },
  },
};
