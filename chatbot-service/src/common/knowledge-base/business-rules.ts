type ValidationRule = {
  type?: string;
  required?: boolean;
  min?: number;
  minLength?: number;
  message?: string;
  itemValidation?: Record<string, ValidationRule>;
};

type BusinessRule = {
  requiredFields?: string[];
  optionalFields?: string[];
  statusFlow?: string[];
  cannotCreateWithoutQuotation?: boolean;
  cannotCancelIfCompleted?: boolean;
  cannotUpdateIfCompleted?: boolean;
  canLinkToPurchaseOrder?: boolean;
  cannotIssueMoreThanAvailable?: boolean;
  mustCheckAvailabilityBeforeIssue?: boolean;
  cannotHaveNegativeQuantity?: boolean;
  mustHaveValidPrices?: boolean;
  validationRules?: Record<string, ValidationRule>;
  businessLogic?: {
    availableQuantity?: (inventory: any) => number;
    canIssue?: (inventory: any, requestedQuantity: number) => boolean;
  };
};

export const BUSINESS_RULES: Record<string, BusinessRule> = {
  purchaseOrder: {
    requiredFields: ['supplierCompanyId', 'quotationId', 'receiveWarehouseId'],
    optionalFields: ['paymentMethod', 'deliveryToAddress'],
    statusFlow: ['DRAFT', 'PENDING', 'APPROVED', 'COMPLETED', 'CANCELLED'],
    cannotCreateWithoutQuotation: true,
    cannotCancelIfCompleted: true,
    cannotUpdateIfCompleted: true,
    validationRules: {
      supplierCompanyId: {
        type: 'number',
        required: true,
        message: 'Phải chọn nhà cung cấp',
      },
      quotationId: {
        type: 'number',
        required: true,
        message: 'Phải có báo giá (quotation) trước khi tạo đơn mua hàng',
      },
      receiveWarehouseId: {
        type: 'number',
        required: true,
        message: 'Phải chọn kho nhận hàng',
      },
      purchaseOrderDetails: {
        type: 'array',
        minLength: 1,
        message: 'Phải có ít nhất 1 mặt hàng trong đơn',
        itemValidation: {
          itemId: { type: 'number', required: true },
          quantity: { type: 'number', min: 0.01, required: true },
          itemPrice: { type: 'number', min: 0, required: true },
        },
      },
    },
  },

  salesOrder: {
    requiredFields: ['customerCompanyId', 'deliveryToAddress'],
    optionalFields: ['paymentMethod', 'deliveryFromAddress'],
    statusFlow: ['DRAFT', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
    canLinkToPurchaseOrder: true,
    validationRules: {
      customerCompanyId: {
        type: 'number',
        required: true,
        message: 'Phải chọn khách hàng',
      },
      deliveryToAddress: {
        type: 'string',
        required: true,
        minLength: 10,
        message: 'Phải có địa chỉ giao hàng (ít nhất 10 ký tự)',
      },
      salesOrderDetails: {
        type: 'array',
        minLength: 1,
        message: 'Phải có ít nhất 1 mặt hàng trong đơn',
      },
    },
  },

  inventory: {
    cannotIssueMoreThanAvailable: true,
    mustCheckAvailabilityBeforeIssue: true,
    cannotHaveNegativeQuantity: true,
    validationRules: {
      itemId: {
        type: 'number',
        required: true,
        message: 'Phải chọn mặt hàng',
      },
      warehouseId: {
        type: 'number',
        required: true,
        message: 'Phải chọn kho',
      },
      quantity: {
        type: 'number',
        min: 0,
        required: true,
        message: 'Số lượng phải >= 0',
      },
    },
    businessLogic: {
      availableQuantity: (inventory: any) => {
        return (inventory.quantity || 0) - (inventory.onDemandQuantity || 0);
      },
      canIssue: (inventory: any, requestedQuantity: number) => {
        const available =
          BUSINESS_RULES.inventory.businessLogic.availableQuantity(inventory);
        return available >= requestedQuantity;
      },
    },
  },

  rfq: {
    requiredFields: ['requestedCompanyId'],
    statusFlow: ['DRAFT', 'SENT', 'RECEIVED', 'CANCELLED'],
    validationRules: {
      requestedCompanyId: {
        type: 'number',
        required: true,
        message: 'Phải chọn công ty yêu cầu báo giá',
      },
      rfqDetails: {
        type: 'array',
        minLength: 1,
        message: 'Phải có ít nhất 1 mặt hàng',
      },
    },
  },

  quotation: {
    requiredFields: ['rfqId'],
    statusFlow: ['DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED'],
    mustHaveValidPrices: true,
    validationRules: {
      rfqId: {
        type: 'number',
        required: true,
        message: 'Phải liên kết với RFQ',
      },
      quotationDetails: {
        type: 'array',
        minLength: 1,
        message: 'Phải có ít nhất 1 mặt hàng',
        itemValidation: {
          itemPrice: { type: 'number', min: 0, required: true },
        },
      },
    },
  },

  manufactureOrder: {
    requiredFields: ['itemId', 'lineId', 'quantity'],
    statusFlow: ['DRAFT', 'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
    validationRules: {
      itemId: {
        type: 'number',
        required: true,
        message: 'Phải chọn mặt hàng sản xuất',
      },
      lineId: {
        type: 'number',
        required: true,
        message: 'Phải chọn dây chuyền sản xuất',
      },
      quantity: {
        type: 'number',
        min: 0.01,
        required: true,
        message: 'Số lượng phải > 0',
      },
      estimatedStartTime: {
        type: 'date',
        required: false,
        message: 'Thời gian bắt đầu dự kiến',
      },
      estimatedEndTime: {
        type: 'date',
        required: false,
        message: 'Thời gian kết thúc dự kiến',
      },
    },
  },
};

const ACTION_TYPE_MAP: Record<string, string> = {
  create_purchase_order: 'purchaseOrder',
  create_sales_order: 'salesOrder',
  check_inventory: 'inventory',
};

function validateField(
  field: string,
  value: any,
  rule: ValidationRule,
  errors: string[],
): void {
  if (rule.required && !value) {
    errors.push(rule.message || `Thiếu ${field}`);
    return;
  }

  if (!value) return;

  if (rule.type === 'number' && typeof value !== 'number') {
    errors.push(`${field} phải là số`);
  }

  if (rule.type === 'string' && typeof value !== 'string') {
    errors.push(`${field} phải là chuỗi`);
  }

  if (rule.min !== undefined && typeof value === 'number' && value < rule.min) {
    errors.push(`${field} phải >= ${rule.min}`);
  }

  if (
    rule.minLength !== undefined &&
    typeof value === 'string' &&
    value.length < rule.minLength
  ) {
    errors.push(`${field} phải có ít nhất ${rule.minLength} ký tự`);
  }
}

function validateArrayItems(
  field: string,
  items: any[],
  itemValidation: Record<string, ValidationRule>,
  errors: string[],
): void {
  items.forEach((item, index) => {
    for (const [itemField, itemRule] of Object.entries(itemValidation)) {
      const itemValue = item[itemField];
      if (itemRule.required && !itemValue) {
        errors.push(`Mặt hàng thứ ${index + 1}: Thiếu ${itemField}`);
      }
      if (
        itemValue &&
        itemRule.min !== undefined &&
        typeof itemValue === 'number' &&
        itemValue < itemRule.min
      ) {
        errors.push(`Mặt hàng thứ ${index + 1}: ${itemField} phải >= ${itemRule.min}`);
      }
    }
  });
}

export function validateAction(
  actionType: string,
  params: Record<string, any>,
): { valid: boolean; errors: string[] } {
  const ruleKey = ACTION_TYPE_MAP[actionType];
  if (!ruleKey) {
    return { valid: true, errors: [] };
  }

  const rules = BUSINESS_RULES[ruleKey];
  if (!rules) {
    return { valid: false, errors: [`Unknown action type: ${actionType}`] };
  }

  const errors: string[] = [];

  if (rules.requiredFields) {
    for (const field of rules.requiredFields) {
      if (!params[field]) {
        const fieldRule = rules.validationRules?.[field];
        errors.push(fieldRule?.message || `Thiếu trường bắt buộc: ${field}`);
      }
    }
  }

  if (rules.validationRules) {
    for (const [field, rule] of Object.entries(rules.validationRules)) {
      const value = params[field];
      validateField(field, value, rule, errors);

      if (rule.itemValidation && Array.isArray(value)) {
        validateArrayItems(field, value, rule.itemValidation, errors);
      }
    }
  }

  if (actionType === 'create_purchase_order' && rules.cannotCreateWithoutQuotation) {
    if (!params.quotationId) {
      errors.push('Không thể tạo đơn mua hàng mà không có báo giá (quotation)');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Check status transition is valid
 */
export function canTransitionStatus(
  entityType: string,
  currentStatus: string,
  newStatus: string,
): boolean {
  const rules = BUSINESS_RULES[entityType];
  if (!rules?.statusFlow) return false;

  if (newStatus === 'CANCELLED') {
    return currentStatus !== 'COMPLETED' && currentStatus !== 'DELIVERED';
  }

  const currentIndex = rules.statusFlow.indexOf(currentStatus);
  const newIndex = rules.statusFlow.indexOf(newStatus);
  return newIndex >= currentIndex;
}

export function getNextPossibleStatuses(
  entityType: string,
  currentStatus: string,
): string[] {
  const rules = BUSINESS_RULES[entityType];
  if (!rules?.statusFlow) return [];

  const currentIndex = rules.statusFlow.indexOf(currentStatus);
  if (currentIndex === -1) return [];

  const nextStatuses = rules.statusFlow.slice(currentIndex + 1);
  if (currentStatus !== 'COMPLETED' && currentStatus !== 'DELIVERED') {
    nextStatuses.push('CANCELLED');
  }

  return nextStatuses;
}
