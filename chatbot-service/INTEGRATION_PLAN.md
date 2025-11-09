# Kế Hoạch Tích Hợp Chatbot AI vào Hệ Thống Supply Chain

## 📋 Mục Lục
1. [Tổng Quan](#tổng-quan)
2. [Giai Đoạn 1: Chuẩn Bị Dữ Liệu](#giai-đoạn-1-chuẩn-bị-dữ-liệu)
3. [Giai Đoạn 2: Phân Tích & Mapping Dữ Liệu](#giai-đoạn-2-phân-tích--mapping-dữ-liệu)
4. [Giai Đoạn 3: Prompt Engineering](#giai-đoạn-3-prompt-engineering)
5. [Giai Đoạn 4: Training & Fine-tuning](#giai-đoạn-4-training--fine-tuning)
6. [Giai Đoạn 5: Data Integration Layer](#giai-đoạn-5-data-integration-layer)
7. [Giai Đoạn 6: Validation & Testing](#giai-đoạn-6-validation--testing)
8. [Giai Đoạn 7: Monitoring & Improvement](#giai-đoạn-7-monitoring--improvement)

---

## 🎯 Tổng Quan

### Mục Tiêu
Tích hợp chatbot AI có khả năng:
- ✅ Hiểu và trả lời câu hỏi về supply chain bằng tiếng Việt
- ✅ Truy vấn dữ liệu thực tế từ các microservices
- ✅ Thực hiện các action (tạo PO, SO, RFQ, etc.)
- ✅ Phân tích và đưa ra insights từ dữ liệu
- ✅ Độ chính xác cao (>90%) cho các câu hỏi nghiệp vụ

### Kiến Trúc Hiện Tại
```
User → Chatbot Service (WebSocket)
         ↓
    Intent Recognition (OpenAI)
         ↓
    Action Executor → RabbitMQ → Other Services
         ↓
    Response Formatter → User
```

---

## 📊 Giai Đoạn 1: Chuẩn Bị Dữ Liệu

### 1.1. Thu Thập Dữ Liệu Từ Các Service

#### A. Business Service Data
**Purchase Orders:**
- PO Code, Status, Supplier, Items, Quantities, Prices
- Dates: createdOn, lastUpdatedOn
- Payment methods, Delivery addresses
- Purchase Order Details (itemId, quantity, price, discount)

**Sales Orders:**
- SO Code, Status, Customer, Items
- Related Purchase Order
- Delivery addresses
- Sales Order Details

**RFQ & Quotations:**
- RFQ Status, Requested Company
- Quotation details, Prices, Validity

#### B. Inventory Service Data
**Warehouses:**
- Warehouse Code, Name, Type
- Max Capacity, Current Capacity
- Location/Address, Status

**Inventory:**
- Item quantities per warehouse
- On-demand quantities
- Available quantities

**Tickets:**
- Receive Tickets, Issue Tickets, Transfer Tickets
- Status, Dates, Items

#### C. General Service Data
**Items:**
- Item Code, Name, Type
- UOM (Unit of Measure)
- Import/Export Prices
- Technical Specifications
- Description

**Products:**
- Serial Numbers, Batch Numbers
- QR Codes
- Related Items

**Manufacture Plants & Lines:**
- Plant information
- Line information

#### D. Operation Service Data
**Manufacture Orders:**
- MO Code, Status, Type
- Item, Line, Quantity
- Estimated start/end times

**BOM (Bill of Materials):**
- Components, Quantities
- Relationships

**Delivery Orders:**
- DO Code, Status
- Related Sales Order
- Delivery details

### 1.2. Tạo Knowledge Base

#### A. Domain-Specific Vocabulary
```typescript
// chatbot-service/src/common/knowledge-base/domain-vocabulary.ts
export const SUPPLY_CHAIN_VOCABULARY = {
  // Entities
  purchaseOrder: ['đơn mua hàng', 'PO', 'purchase order', 'đơn hàng mua'],
  salesOrder: ['đơn bán hàng', 'SO', 'sales order', 'đơn hàng bán'],
  inventory: ['tồn kho', 'kho hàng', 'inventory', 'stock'],
  warehouse: ['kho', 'warehouse', 'kho hàng'],
  item: ['mặt hàng', 'item', 'hàng hóa', 'sản phẩm'],
  supplier: ['nhà cung cấp', 'supplier', 'vendor'],
  customer: ['khách hàng', 'customer', 'client'],
  
  // Actions
  check: ['kiểm tra', 'xem', 'check', 'tìm'],
  create: ['tạo', 'create', 'thêm', 'add'],
  update: ['cập nhật', 'update', 'sửa', 'edit'],
  status: ['trạng thái', 'status', 'tình trạng'],
  
  // Statuses
  pending: ['chờ', 'pending', 'đang chờ'],
  approved: ['đã duyệt', 'approved', 'được duyệt'],
  completed: ['hoàn thành', 'completed', 'xong'],
  cancelled: ['hủy', 'cancelled', 'đã hủy'],
};
```

#### B. Business Rules & Constraints
```typescript
// chatbot-service/src/common/knowledge-base/business-rules.ts
export const BUSINESS_RULES = {
  purchaseOrder: {
    requiredFields: ['supplierCompanyId', 'quotationId', 'receiveWarehouseId'],
    statusFlow: ['DRAFT', 'PENDING', 'APPROVED', 'COMPLETED', 'CANCELLED'],
    cannotCreateWithoutQuotation: true,
  },
  salesOrder: {
    requiredFields: ['customerCompanyId', 'deliveryToAddress'],
    statusFlow: ['DRAFT', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'],
  },
  inventory: {
    cannotIssueMoreThanAvailable: true,
    mustCheckAvailabilityBeforeIssue: true,
  },
};
```

#### C. Sample Queries & Responses
```typescript
// chatbot-service/src/common/knowledge-base/sample-qa.ts
export const SAMPLE_QA_PAIRS = [
  {
    question: "Tồn kho item I000100001 ở kho Hà Nội còn bao nhiêu?",
    intent: "CHECK_INVENTORY",
    entities: { itemId: "I000100001", warehouseName: "Hà Nội" },
    expectedResponse: "Item I000100001 tại kho Hà Nội hiện có {quantity} {uom}",
  },
  {
    question: "Đơn hàng PO-2024-001 đang ở trạng thái gì?",
    intent: "GET_ORDER_STATUS",
    entities: { orderCode: "PO-2024-001" },
    expectedResponse: "Đơn hàng PO-2024-001 đang ở trạng thái {status}",
  },
  // ... more examples
];
```

### 1.3. Tạo Data Schema Documentation

```typescript
// chatbot-service/src/common/knowledge-base/data-schema.ts
export const DATA_SCHEMA = {
  purchaseOrder: {
    fields: {
      poId: 'number',
      poCode: 'string',
      companyId: 'number',
      supplierCompanyId: 'number',
      status: 'string',
      purchaseOrderDetails: 'array',
    },
    relationships: {
      quotation: 'Quotation',
      purchaseOrderDetails: 'PurchaseOrderDetail[]',
    },
  },
  // ... other schemas
};
```

---

## 🔍 Giai Đoạn 2: Phân Tích & Mapping Dữ Liệu

### 2.1. Tạo Data Mapping Service

```typescript
// chatbot-service/src/modules/data-mapping/data-mapping.service.ts
@Injectable()
export class DataMappingService {
  /**
   * Map raw data từ service thành format dễ hiểu cho LLM
   */
  mapPurchaseOrderToReadable(po: any): string {
    return `
Đơn mua hàng: ${po.poCode}
- Nhà cung cấp: ${po.supplierCompanyId}
- Trạng thái: ${po.status}
- Ngày tạo: ${po.createdOn}
- Chi tiết:
${po.purchaseOrderDetails?.map(d => 
  `  • Item ${d.itemId}: ${d.quantity} ${d.uom} - ${d.itemPrice} VNĐ`
).join('\n')}
    `;
  }

  mapInventoryToReadable(inventory: any[]): string {
    return inventory.map(inv => 
      `Kho ${inv.warehouseName}: ${inv.quantity} ${inv.uom} (Còn lại: ${inv.quantity - inv.onDemandQuantity})`
    ).join('\n');
  }
}
```

### 2.2. Tạo Data Aggregation Service

```typescript
// chatbot-service/src/modules/data-aggregation/data-aggregation.service.ts
@Injectable()
export class DataAggregationService {
  /**
   * Tổng hợp dữ liệu từ nhiều nguồn để trả lời câu hỏi phức tạp
   */
  async getComprehensiveOrderInfo(orderCode: string, companyId: number) {
    // Lấy PO
    const po = await this.getPurchaseOrder(orderCode);
    
    // Lấy items trong PO
    const items = await Promise.all(
      po.purchaseOrderDetails.map(d => this.getItemInfo(d.itemId))
    );
    
    // Lấy inventory cho các items
    const inventories = await Promise.all(
      items.map(item => this.getInventoryForItem(item.itemId))
    );
    
    return {
      order: po,
      items,
      inventories,
      summary: this.generateSummary(po, items, inventories),
    };
  }
}
```

---

## 🎨 Giai Đoạn 3: Prompt Engineering

### 3.1. System Prompt Template

```typescript
// chatbot-service/src/modules/llm/prompts/system-prompt.template.ts
export const SYSTEM_PROMPT_TEMPLATE = `
Bạn là trợ lý AI chuyên nghiệp cho hệ thống quản lý chuỗi cung ứng (Supply Chain Management System).

## KIẾN THỨC VỀ HỆ THỐNG

### 1. Các Entity Chính:
- **Purchase Order (PO)**: Đơn mua hàng từ nhà cung cấp
  - Mã: poCode (ví dụ: PO-2024-001)
  - Trạng thái: DRAFT, PENDING, APPROVED, COMPLETED, CANCELLED
  - Bắt buộc: supplierCompanyId, quotationId, receiveWarehouseId
  
- **Sales Order (SO)**: Đơn bán hàng cho khách hàng
  - Mã: soCode (ví dụ: SO-2024-001)
  - Trạng thái: DRAFT, PENDING, CONFIRMED, SHIPPED, DELIVERED
  
- **Inventory**: Tồn kho của item tại warehouse
  - quantity: Số lượng hiện có
  - onDemandQuantity: Số lượng đã được đặt hàng
  - availableQuantity = quantity - onDemandQuantity
  
- **Item**: Mặt hàng trong hệ thống
  - Mã: itemCode (ví dụ: I000100001)
  - Có: itemName, itemType, uom (đơn vị), importPrice, exportPrice
  
- **Warehouse**: Kho hàng
  - Mã: warehouseCode
  - Có: warehouseName, warehouseType, maxCapacity, status

### 2. Quy Tắc Nghiệp Vụ:
- Không thể tạo PO mà không có Quotation
- Không thể xuất kho nhiều hơn số lượng có sẵn
- Phải kiểm tra tồn kho trước khi tạo đơn hàng
- Status flow: DRAFT → PENDING → APPROVED → COMPLETED

### 3. Cách Trả Lời:
- Luôn trả lời bằng tiếng Việt tự nhiên
- Sử dụng dữ liệu thực tế từ hệ thống
- Nếu không có dữ liệu, nói rõ "Tôi không tìm thấy..."
- Đưa ra số liệu cụ thể (số lượng, giá, ngày tháng)
- Format số: dùng dấu phẩy cho hàng nghìn (1,000)
- Format ngày: "ngày DD/MM/YYYY"

### 4. Xử Lý Câu Hỏi:
- Nếu câu hỏi mơ hồ → Hỏi lại để làm rõ
- Nếu thiếu thông tin → Yêu cầu bổ sung
- Nếu có lỗi → Giải thích lỗi và hướng xử lý

## NGỮ CẢNH HIỆN TẠI:
- Company ID: {companyId}
- User ID: {userId}
- Session ID: {sessionId}
`;
```

### 3.2. Intent Recognition Prompt

```typescript
// chatbot-service/src/modules/llm/prompts/intent-prompt.template.ts
export const INTENT_RECOGNITION_PROMPT = `
Phân tích câu hỏi tiếng Việt sau và xác định intent chính xác.

Câu hỏi: "{message}"

Lịch sử hội thoại gần đây:
{conversationHistory}

## CÁC INTENT CÓ THỂ:

### QUERY INTENTS (Truy vấn thông tin):
1. **CHECK_INVENTORY** - Kiểm tra tồn kho
   - Keywords: "tồn kho", "còn bao nhiêu", "số lượng", "kiểm tra kho"
   - Entities: itemId, itemCode, itemName, warehouseId, warehouseName
   
2. **GET_ORDER_STATUS** - Xem trạng thái đơn hàng
   - Keywords: "trạng thái", "tình trạng", "đơn hàng", "PO", "SO"
   - Entities: orderCode, orderId, poCode, soCode
   
3. **FIND_ITEM** - Tìm mặt hàng
   - Keywords: "tìm item", "tìm hàng", "item nào", "mặt hàng"
   - Entities: itemCode, itemName, itemType
   
4. **CHECK_WAREHOUSE** - Xem thông tin kho
   - Keywords: "kho", "warehouse", "danh sách kho"
   - Entities: warehouseId, warehouseName, warehouseCode
   
5. **VIEW_REPORT** - Xem báo cáo
   - Keywords: "báo cáo", "report", "thống kê", "tổng hợp"
   - Entities: reportType, dateRange, companyId

### ACTION INTENTS (Thực hiện hành động):
6. **CREATE_PURCHASE_ORDER** - Tạo đơn mua hàng
   - Keywords: "tạo PO", "tạo đơn mua", "mua hàng"
   - Entities: supplierId, items[], quantities[], warehouseId
   
7. **CREATE_SALES_ORDER** - Tạo đơn bán hàng
   - Keywords: "tạo SO", "tạo đơn bán", "bán hàng"
   - Entities: customerId, items[], quantities[], deliveryAddress
   
8. **CREATE_RFQ** - Tạo yêu cầu báo giá
   - Keywords: "tạo RFQ", "yêu cầu báo giá", "request for quotation"
   - Entities: items[], quantities[], requestedCompanyId
   
9. **CREATE_QUOTATION** - Tạo báo giá
   - Keywords: "tạo báo giá", "quotation"
   - Entities: rfqId, items[], prices[]

### GENERAL INTENTS:
10. **GREETING** - Chào hỏi
11. **HELP** - Yêu cầu trợ giúp
12. **GOODBYE** - Tạm biệt
13. **GENERAL_CHAT** - Trò chuyện chung

## YÊU CẦU:
1. Xác định intent chính xác nhất
2. Confidence score từ 0.0 đến 1.0
3. Extract tất cả entities có thể
4. Nếu confidence < 0.7 → trả về "GENERAL_CHAT"

Trả về JSON:
{
  "intent": "intent_name",
  "confidence": 0.95,
  "entities": {
    "itemId": 123,
    "itemCode": "I000100001",
    "warehouseName": "Hà Nội",
    "orderCode": "PO-2024-001",
    "quantity": 100
  },
  "reasoning": "Lý do chọn intent này"
}
`;

```

### 3.3. Response Formatting Prompt

```typescript
// chatbot-service/src/modules/llm/prompts/response-format.template.ts
export const RESPONSE_FORMAT_PROMPT = `
Bạn nhận được dữ liệu sau từ hệ thống. Hãy format thành câu trả lời tự nhiên bằng tiếng Việt.

Intent: {intent}
Dữ liệu: {data}

Yêu cầu:
1. Trả lời ngắn gọn, dễ hiểu
2. Sử dụng số liệu cụ thể
3. Format số: 1,000 (dấu phẩy)
4. Format ngày: DD/MM/YYYY
5. Nếu là danh sách, chỉ hiển thị 5-10 items đầu
6. Nếu có lỗi, giải thích rõ ràng

Ví dụ format:
- Inventory: "Item {itemName} tại kho {warehouseName} hiện có {quantity} {uom}"
- Order: "Đơn hàng {orderCode} đang ở trạng thái {status}, tạo ngày {date}"
- List: "Tìm thấy {count} kết quả:\n1. {item1}\n2. {item2}..."
`;
```

---

## 🎓 Giai Đoạn 4: Training & Fine-tuning

### 4.1. Tạo Training Dataset

```typescript
// chatbot-service/src/training/dataset-generator.ts
export class DatasetGenerator {
  /**
   * Tạo dataset từ dữ liệu thực tế
   */
  async generateTrainingDataset() {
    const dataset = [];
    
    // 1. Query intents
    const inventoryQueries = await this.generateInventoryQueries();
    const orderQueries = await this.generateOrderQueries();
    
    // 2. Action intents
    const createOrderQueries = await this.generateCreateOrderQueries();
    
    // 3. Combine và format
    return {
      training: [...inventoryQueries, ...orderQueries, ...createOrderQueries],
      validation: this.splitValidationSet(dataset),
    };
  }

  private async generateInventoryQueries() {
    const items = await this.getAllItems();
    const warehouses = await this.getAllWarehouses();
    
    const queries = [];
    for (const item of items) {
      for (const warehouse of warehouses) {
        queries.push({
          input: `Tồn kho ${item.itemName} ở kho ${warehouse.warehouseName} còn bao nhiêu?`,
          output: {
            intent: 'CHECK_INVENTORY',
            entities: {
              itemId: item.itemId,
              itemCode: item.itemCode,
              warehouseId: warehouse.warehouseId,
            },
          },
        });
      }
    }
    return queries;
  }
}
```

### 4.2. Few-Shot Learning Examples

```typescript
// chatbot-service/src/modules/llm/prompts/few-shot-examples.ts
export const FEW_SHOT_EXAMPLES = [
  {
    user: "Tồn kho item I000100001 ở kho Hà Nội còn bao nhiêu?",
    assistant: "Để kiểm tra tồn kho, tôi cần tìm item I000100001 và kho Hà Nội...",
    reasoning: "Extract itemCode và warehouseName, gọi API check inventory",
  },
  {
    user: "Đơn hàng PO-2024-001 đang ở trạng thái gì?",
    assistant: "Đơn hàng PO-2024-001 đang ở trạng thái APPROVED, được tạo ngày 15/01/2024.",
    reasoning: "Extract poCode, gọi API get purchase order, format response",
  },
  // ... more examples
];
```

### 4.3. Fine-tuning Strategy

**Option 1: OpenAI Fine-tuning (Recommended)**
```bash
# 1. Prepare training data in JSONL format
# 2. Upload to OpenAI
openai api fine_tunes.create \
  -t training_data.jsonl \
  -m gpt-4o-mini \
  --suffix "supply-chain-chatbot"

# 3. Use fine-tuned model
model: "ft:gpt-4o-mini:your-org:supply-chain-chatbot:abc123"
```

**Option 2: RAG (Retrieval Augmented Generation)**
- Lưu knowledge base trong vector database
- Retrieve relevant context khi generate response
- Không cần fine-tuning, dễ update

**Option 3: Hybrid Approach**
- Fine-tune cho intent recognition
- RAG cho domain knowledge
- Best of both worlds

---

## 🔌 Giai Đoạn 5: Data Integration Layer

### 5.1. Enhanced Action Executor

```typescript
// chatbot-service/src/modules/action/enhanced-action-executor.service.ts
@Injectable()
export class EnhancedActionExecutorService {
  /**
   * Execute action với validation và error handling tốt hơn
   */
  async executeActionWithValidation(action: ActionRequest): Promise<ActionResult> {
    // 1. Validate input
    const validation = await this.validateAction(action);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.errors.join(', '),
      };
    }

    // 2. Pre-check (ví dụ: check inventory before create order)
    const preCheck = await this.preCheckAction(action);
    if (!preCheck.passed) {
      return {
        success: false,
        error: preCheck.reason,
        suggestions: preCheck.suggestions,
      };
    }

    // 3. Execute
    try {
      const result = await this.executeAction(action);
      
      // 4. Post-process (format, enrich data)
      const enriched = await this.enrichResult(result, action);
      
      return {
        success: true,
        data: enriched,
        message: this.formatSuccessMessage(action, enriched),
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        retryable: this.isRetryableError(error),
      };
    }
  }

  private async validateAction(action: ActionRequest) {
    const errors = [];
    
    if (action.type === 'CREATE_PURCHASE_ORDER') {
      if (!action.params.supplierCompanyId) {
        errors.push('Thiếu nhà cung cấp');
      }
      if (!action.params.items || action.params.items.length === 0) {
        errors.push('Thiếu danh sách mặt hàng');
      }
    }
    
    return { valid: errors.length === 0, errors };
  }

  private async preCheckAction(action: ActionRequest) {
    if (action.type === 'CREATE_PURCHASE_ORDER') {
      // Check inventory availability
      for (const item of action.params.items) {
        const inventory = await this.checkInventory(item.itemId, action.params.receiveWarehouseId);
        if (inventory.availableQuantity < item.quantity) {
          return {
            passed: false,
            reason: `Không đủ tồn kho cho item ${item.itemId}. Chỉ còn ${inventory.availableQuantity}`,
            suggestions: ['Giảm số lượng', 'Chọn kho khác', 'Tạo đơn mua hàng mới'],
          };
        }
      }
    }
    
    return { passed: true };
  }
}
```

### 5.2. Data Enrichment Service

```typescript
// chatbot-service/src/modules/data-enrichment/data-enrichment.service.ts
@Injectable()
export class DataEnrichmentService {
  /**
   * Làm giàu dữ liệu với thông tin liên quan
   */
  async enrichPurchaseOrder(po: any): Promise<any> {
    // 1. Get supplier info
    const supplier = await this.getCompanyInfo(po.supplierCompanyId);
    
    // 2. Get warehouse info
    const warehouse = await this.getWarehouseInfo(po.receiveWarehouseId);
    
    // 3. Get item details
    const items = await Promise.all(
      po.purchaseOrderDetails.map(d => this.getItemInfo(d.itemId))
    );
    
    // 4. Calculate totals
    const totalAmount = po.purchaseOrderDetails.reduce(
      (sum, d) => sum + (d.quantity * d.itemPrice * (1 - d.discount / 100)),
      0
    );
    
    return {
      ...po,
      supplierName: supplier?.name,
      warehouseName: warehouse?.warehouseName,
      items: items.map((item, idx) => ({
        ...item,
        ...po.purchaseOrderDetails[idx],
      })),
      totalAmount,
      formattedTotalAmount: this.formatCurrency(totalAmount),
    };
  }
}
```

### 5.3. Caching Strategy

```typescript
// chatbot-service/src/modules/cache/cache.service.ts
@Injectable()
export class CacheService {
  /**
   * Cache dữ liệu thường dùng để giảm latency
   */
  async getCachedOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 300, // 5 minutes
  ): Promise<T> {
    // Try cache first
    const cached = await this.redisClient.get(key);
    if (cached) {
      return JSON.parse(cached);
    }
    
    // Fetch and cache
    const data = await fetcher();
    await this.redisClient.setex(key, ttl, JSON.stringify(data));
    return data;
  }

  // Cache keys
  getItemCacheKey(itemId: number) {
    return `item:${itemId}`;
  }

  getWarehouseCacheKey(warehouseId: number) {
    return `warehouse:${warehouseId}`;
  }

  getInventoryCacheKey(itemId: number, warehouseId: number) {
    return `inventory:${itemId}:${warehouseId}`;
  }
}
```

---

## ✅ Giai Đoạn 6: Validation & Testing

### 6.1. Test Cases

```typescript
// chatbot-service/src/test/chatbot.test.ts
describe('Chatbot Integration Tests', () => {
  it('should correctly identify CHECK_INVENTORY intent', async () => {
    const result = await chatService.processMessage({
      message: 'Tồn kho item I000100001 ở kho Hà Nội còn bao nhiêu?',
      sessionId: 'test-session',
      userId: 1,
      companyId: 1,
    });
    
    expect(result.intent).toBe('CHECK_INVENTORY');
    expect(result.data).toHaveProperty('quantity');
  });

  it('should validate before creating purchase order', async () => {
    const result = await chatService.processMessage({
      message: 'Tạo đơn mua hàng cho 1000 units item I000100001',
      sessionId: 'test-session',
      userId: 1,
      companyId: 1,
    });
    
    // Should ask for missing info (supplier, warehouse)
    expect(result.message).toContain('nhà cung cấp');
  });
});
```

### 6.2. Accuracy Metrics

```typescript
// chatbot-service/src/modules/analytics/accuracy-tracker.service.ts
@Injectable()
export class AccuracyTrackerService {
  /**
   * Track accuracy của intent recognition và responses
   */
  async trackIntentAccuracy(
    userMessage: string,
    predictedIntent: string,
    actualIntent?: string,
  ) {
    // Log for analysis
    await this.logEvent({
      type: 'INTENT_PREDICTION',
      userMessage,
      predictedIntent,
      actualIntent,
      timestamp: new Date(),
    });
    
    // Calculate accuracy
    if (actualIntent) {
      const isCorrect = predictedIntent === actualIntent;
      await this.updateAccuracyMetrics(isCorrect);
    }
  }

  async trackResponseQuality(
    sessionId: string,
    userMessage: string,
    botResponse: string,
    userFeedback?: 'helpful' | 'not_helpful',
  ) {
    await this.logEvent({
      type: 'RESPONSE_QUALITY',
      sessionId,
      userMessage,
      botResponse,
      userFeedback,
      timestamp: new Date(),
    });
  }
}
```

---

## 📈 Giai Đoạn 7: Monitoring & Improvement

### 7.1. Logging & Analytics

```typescript
// chatbot-service/src/modules/analytics/analytics.service.ts
@Injectable()
export class AnalyticsService {
  /**
   * Track các metrics quan trọng
   */
  async trackMetrics() {
    return {
      // Intent accuracy
      intentAccuracy: await this.calculateIntentAccuracy(),
      
      // Response time
      averageResponseTime: await this.getAverageResponseTime(),
      
      // Error rate
      errorRate: await this.getErrorRate(),
      
      // User satisfaction
      userSatisfaction: await this.getUserSatisfaction(),
      
      // Most common intents
      topIntents: await this.getTopIntents(10),
      
      // Failed queries
      failedQueries: await this.getFailedQueries(),
    };
  }
}
```

### 7.2. Continuous Improvement Loop

```
1. Collect user interactions
   ↓
2. Analyze failures & edge cases
   ↓
3. Update prompts & examples
   ↓
4. Retrain/fine-tune if needed
   ↓
5. Deploy & monitor
   ↓
6. Repeat
```

---

## 🚀 Implementation Roadmap

### Week 1-2: Data Preparation
- [ ] Extract data schemas từ tất cả services
- [ ] Tạo knowledge base (vocabulary, rules, examples)
- [ ] Setup data mapping services

### Week 3-4: Prompt Engineering
- [ ] Design system prompts
- [ ] Create intent recognition prompts
- [ ] Build response formatting templates
- [ ] Test với sample queries

### Week 5-6: Integration
- [ ] Enhance action executor
- [ ] Implement data enrichment
- [ ] Add caching layer
- [ ] Error handling & validation

### Week 7-8: Training & Testing
- [ ] Generate training dataset
- [ ] Fine-tune model (if needed)
- [ ] Write test cases
- [ ] User acceptance testing

### Week 9-10: Monitoring & Optimization
- [ ] Setup analytics
- [ ] Monitor accuracy metrics
- [ ] Iterate based on feedback
- [ ] Documentation

---

## 📝 Notes

### Best Practices:
1. **Always validate input** trước khi gọi external services
2. **Cache frequently accessed data** để giảm latency
3. **Provide clear error messages** với suggestions
4. **Log everything** để debug và improve
5. **Test với real data** từ production (anonymized)

### Common Pitfalls:
1. ❌ Không validate input → Gọi API với data sai
2. ❌ Không handle errors → User thấy lỗi kỹ thuật
3. ❌ Không cache → Response chậm
4. ❌ Prompt quá dài → Token limit, cost cao
5. ❌ Không test edge cases → Fail trong production

