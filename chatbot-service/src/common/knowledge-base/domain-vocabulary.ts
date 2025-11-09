type EntityDefinition = {
  terms: string[];
  codes?: {
    prefix: string;
    pattern: RegExp;
  };
};

type Vocabulary = Record<string, EntityDefinition>;

export const SUPPLY_CHAIN_VOCABULARY: Vocabulary = {
  // Entities - Đơn hàng
  purchaseOrder: {
    terms: ['đơn mua hàng', 'PO', 'purchase order', 'đơn hàng mua', 'đơn mua'],
    codes: {
      prefix: 'PO-',
      pattern: /PO-\d{4}-\d{3,}/i,
    },
  },
  salesOrder: {
    terms: ['đơn bán hàng', 'SO', 'sales order', 'đơn hàng bán', 'đơn bán'],
    codes: {
      prefix: 'SO-',
      pattern: /SO-\d{4}-\d{3,}/i,
    },
  },
  rfq: {
    terms: ['yêu cầu báo giá', 'RFQ', 'request for quotation', 'báo giá'],
    codes: {
      prefix: 'RFQ-',
      pattern: /RFQ-\d{4}-\d{3,}/i,
    },
  },
  quotation: {
    terms: ['báo giá', 'quotation', 'báo giá'],
    codes: {
      prefix: 'QT-',
      pattern: /QT-\d{4}-\d{3,}/i,
    },
  },
  manufactureOrder: {
    terms: ['lệnh sản xuất', 'MO', 'manufacture order', 'đơn sản xuất'],
    codes: {
      prefix: 'MO-',
      pattern: /MO-\d{4}-\d{3,}/i,
    },
  },
  deliveryOrder: {
    terms: ['đơn giao hàng', 'DO', 'delivery order', 'phiếu giao'],
    codes: {
      prefix: 'DO-',
      pattern: /DO-\d{4}-\d{3,}/i,
    },
  },

  // Entities - Kho hàng
  inventory: {
    terms: ['tồn kho', 'kho hàng', 'inventory', 'stock', 'số lượng tồn'],
  },
  warehouse: {
    terms: ['kho', 'warehouse', 'kho hàng', 'nhà kho'],
  },
  item: {
    terms: ['mặt hàng', 'item', 'hàng hóa', 'sản phẩm', 'vật liệu'],
    codes: {
      prefix: 'I',
      pattern: /I\d{9,}/i,
    },
  },
  product: {
    terms: ['sản phẩm', 'product', 'hàng hóa'],
  },

  // Entities - Đối tác
  supplier: {
    terms: ['nhà cung cấp', 'supplier', 'vendor', 'người bán'],
  },
  customer: {
    terms: ['khách hàng', 'customer', 'client', 'người mua'],
  },
  company: {
    terms: ['công ty', 'company', 'doanh nghiệp'],
  },

  // Actions
  check: {
    terms: ['kiểm tra', 'xem', 'check', 'tìm', 'tra cứu', 'xem thông tin'],
  },
  create: {
    terms: ['tạo', 'create', 'thêm', 'add', 'lập', 'tạo mới'],
  },
  update: {
    terms: ['cập nhật', 'update', 'sửa', 'edit', 'thay đổi'],
  },
  delete: {
    terms: ['xóa', 'delete', 'remove', 'hủy'],
  },
  approve: {
    terms: ['duyệt', 'approve', 'phê duyệt', 'chấp nhận'],
  },
  cancel: {
    terms: ['hủy', 'cancel', 'hủy bỏ'],
  },

  // Status
  status: {
    terms: ['trạng thái', 'status', 'tình trạng', 'trạng thái hiện tại'],
  },
  pending: {
    terms: ['chờ', 'pending', 'đang chờ', 'chờ xử lý'],
  },
  approved: {
    terms: ['đã duyệt', 'approved', 'được duyệt', 'đã phê duyệt'],
  },
  completed: {
    terms: ['hoàn thành', 'completed', 'xong', 'đã hoàn thành'],
  },
  cancelled: {
    terms: ['hủy', 'cancelled', 'đã hủy', 'hủy bỏ'],
  },
  draft: {
    terms: ['nháp', 'draft', 'bản nháp'],
  },
  confirmed: {
    terms: ['đã xác nhận', 'confirmed', 'xác nhận'],
  },
  shipped: {
    terms: ['đã giao', 'shipped', 'đang vận chuyển'],
  },
  delivered: {
    terms: ['đã giao hàng', 'delivered', 'đã nhận'],
  },

  // Quantities & Units
  quantity: {
    terms: ['số lượng', 'quantity', 'số', 'lượng'],
  },
  unit: {
    terms: ['đơn vị', 'unit', 'uom'],
  },
  price: {
    terms: ['giá', 'price', 'giá tiền', 'giá cả'],
  },
  total: {
    terms: ['tổng', 'total', 'tổng cộng', 'tổng tiền'],
  },
  amount: {
    terms: ['số tiền', 'amount', 'giá trị'],
  },

  // Time & Dates
  date: {
    terms: ['ngày', 'date', 'ngày tháng'],
  },
  today: {
    terms: ['hôm nay', 'today', 'ngày hôm nay'],
  },
  yesterday: {
    terms: ['hôm qua', 'yesterday', 'ngày hôm qua'],
  },
  thisWeek: {
    terms: ['tuần này', 'this week', 'tuần hiện tại'],
  },
  thisMonth: {
    terms: ['tháng này', 'this month', 'tháng hiện tại'],
  },
  thisYear: {
    terms: ['năm này', 'this year', 'năm hiện tại'],
  },
};

export function extractEntityFromMessage(
  message: string,
  entityType: string,
): string | null {
  const entity = SUPPLY_CHAIN_VOCABULARY[entityType];
  if (!entity) return null;

  const lowerMessage = message.toLowerCase();

  for (const term of entity.terms) {
    if (lowerMessage.includes(term.toLowerCase())) {
      return term;
    }
  }

  if (entity.codes?.pattern) {
    const match = message.match(entity.codes.pattern);
    if (match) return match[0];
  }

  return null;
}

export function containsEntity(message: string, entityType: string): boolean {
  return extractEntityFromMessage(message, entityType) !== null;
}

export function getSynonyms(entityType: string): string[] {
  return SUPPLY_CHAIN_VOCABULARY[entityType]?.terms || [];
}
