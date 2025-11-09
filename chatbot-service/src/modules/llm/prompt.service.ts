import { Injectable } from '@nestjs/common';

@Injectable()
export class PromptService {
  getSystemPrompt(context: { companyId?: string; userId?: string }): string {
    return `Bạn là trợ lý AI chuyên nghiệp cho hệ thống quản lý chuỗi cung ứng.

NGỮ CẢNH:
- Company ID: ${context.companyId || 'N/A'}
- User ID: ${context.userId || 'N/A'}

KIẾN THỨC VỀ HỆ THỐNG:

1. Purchase Order (PO):
   - Mã: poCode (format: PO-YYYY-XXX)
   - Trạng thái: DRAFT → PENDING → APPROVED → COMPLETED → CANCELLED
   - Bắt buộc: supplierCompanyId, quotationId, receiveWarehouseId
   - Chi tiết: purchaseOrderDetails[] (itemId, quantity, itemPrice, discount)

2. Sales Order (SO):
   - Mã: soCode (format: SO-YYYY-XXX)
   - Trạng thái: DRAFT → PENDING → CONFIRMED → SHIPPED → DELIVERED
   - Bắt buộc: customerCompanyId, deliveryToAddress

3. Inventory:
   - quantity: Số lượng hiện có
   - onDemandQuantity: Số lượng đã đặt
   - availableQuantity = quantity - onDemandQuantity

4. Item:
   - Mã: itemCode (format: I000100001)
   - Có: itemName, itemType, uom, importPrice, exportPrice

5. Warehouse:
   - Mã: warehouseCode
   - Có: warehouseName, warehouseType, maxCapacity, status

QUY TẮC NGHIỆP VỤ:
- Không thể tạo PO mà không có Quotation
- Không thể xuất kho nhiều hơn availableQuantity
- Phải kiểm tra tồn kho trước khi tạo đơn hàng
- Status flow: DRAFT → PENDING → APPROVED → COMPLETED

CÁCH TRẢ LỜI:
- Luôn trả lời bằng tiếng Việt tự nhiên
- Sử dụng dữ liệu thực tế từ hệ thống
- Nếu không có dữ liệu: "Tôi không tìm thấy..."
- Đưa ra số liệu cụ thể (số lượng, giá, ngày tháng)
- Format số: dùng dấu phẩy cho hàng nghìn (1,000)
- Format ngày: "ngày DD/MM/YYYY"
- Format tiền: "X.XXX.XXX VNĐ"

XỬ LÝ CÂU HỎI:
- Câu hỏi mơ hồ → Hỏi lại để làm rõ
- Thiếu thông tin → Yêu cầu bổ sung
- Có lỗi → Giải thích lỗi và hướng xử lý
- Câu hỏi chung → Trả lời hữu ích và thân thiện`;
  }

  getIntentRecognitionPrompt(message: string, conversationHistory: any[] = []): string {
    const history = conversationHistory
      .slice(-3)
      .map((msg) => `${msg.role}: ${msg.content}`)
      .join('\n');

    return `Phân tích câu hỏi tiếng Việt và xác định intent chính xác.

Câu hỏi: "${message}"
${history ? `Lịch sử hội thoại:\n${history}\n` : ''}

VÍ DỤ:
- "Tồn kho item I000100001 ở kho Hà Nội còn bao nhiêu?" → check_inventory (itemCode: I000100001, warehouseName: Hà Nội)
- "Đơn hàng PO-2024-001 đang ở trạng thái gì?" → get_order_status (poCode: PO-2024-001)
- "Tạo đơn mua hàng cho 100 units item I000100001" → create_purchase_order (quantity: 100, itemCode: I000100001)

CÁC INTENT:

QUERY INTENTS:
1. check_inventory - Kiểm tra tồn kho
   Keywords: "tồn kho", "còn bao nhiêu", "số lượng", "kiểm tra kho"
   Entities: itemId, itemCode, itemName, warehouseId, warehouseName

2. get_order_status - Xem trạng thái đơn hàng
   Keywords: "trạng thái", "tình trạng", "đơn hàng", "PO", "SO"
   Entities: orderCode, orderId, poCode, soCode

3. find_item - Tìm mặt hàng
   Keywords: "tìm item", "tìm hàng", "item nào", "mặt hàng"
   Entities: itemCode, itemName, itemType

4. check_warehouse - Xem thông tin kho
   Keywords: "kho", "warehouse", "danh sách kho"
   Entities: warehouseId, warehouseName, warehouseCode

5. view_report - Xem báo cáo
   Keywords: "báo cáo", "report", "thống kê", "tổng hợp"
   Entities: reportType, dateRange

ACTION INTENTS:
6. create_purchase_order - Tạo đơn mua hàng
   Keywords: "tạo PO", "tạo đơn mua", "mua hàng"
   Entities: supplierId, items[], quantities[], warehouseId

7. create_sales_order - Tạo đơn bán hàng
   Keywords: "tạo SO", "tạo đơn bán", "bán hàng"
   Entities: customerId, items[], quantities[], deliveryAddress

8. create_rfq - Tạo yêu cầu báo giá
   Keywords: "tạo RFQ", "yêu cầu báo giá"
   Entities: items[], quantities[], requestedCompanyId

9. create_quotation - Tạo báo giá
   Keywords: "tạo báo giá", "quotation"
   Entities: rfqId, items[], prices[]

GENERAL INTENTS:
10. greeting - Chào hỏi
11. help - Yêu cầu trợ giúp
12. goodbye - Tạm biệt
13. general.chat - Trò chuyện chung

YÊU CẦU:
1. Xác định intent chính xác nhất
2. Confidence score từ 0.0 đến 1.0
3. Extract tất cả entities có thể
4. Nếu confidence < 0.7 → trả về "general.chat"

LƯU Ý QUAN TRỌNG:
- Extract itemCode từ text: pattern I + 9+ số (ví dụ: I000100001)
- Extract orderCode: PO-YYYY-XXX, SO-YYYY-XXX, MO-YYYY-XXX
- Extract quantity: số lượng kèm đơn vị (ví dụ: "100 units", "50 kg")
- Extract warehouseName: tên kho (ví dụ: "Hà Nội", "Hồ Chí Minh")
- Nếu có itemCode trong text, luôn extract vào entities.itemCode
- Nếu có orderCode trong text, extract vào entities.poCode hoặc entities.soCode

Trả về JSON (chỉ JSON, không thêm text):
{
  "intent": "intent_name",
  "confidence": 0.95,
  "entities": {
    "itemId": 123,
    "itemCode": "I000100001",
    "warehouseName": "Hà Nội",
    "warehouseId": 1,
    "orderCode": "PO-2024-001",
    "poCode": "PO-2024-001",
    "soCode": "SO-2024-001",
    "quantity": 100
  },
  "reasoning": "Lý do chọn intent này"
}`;
  }

  buildDataContextPrompt(data: any, dataType: string): string {
    if (!data) {
      return 'Không có dữ liệu từ hệ thống.';
    }

    const dataStr = JSON.stringify(data, null, 2);
    return `Dữ liệu từ hệ thống (${dataType}):\n${dataStr}\n\nHãy phân tích và trả lời dựa trên dữ liệu này.`;
  }

  buildConversationPrompt(
    currentMessage: string,
    conversationHistory: any[],
    systemData?: any,
  ): string {
    let prompt = 'Lịch sử hội thoại gần đây:\n';

    for (const msg of conversationHistory.slice(-5)) {
      prompt += `${msg.role}: ${msg.content}\n`;
    }

    if (systemData) {
      prompt += `\nDữ liệu hệ thống:\n${JSON.stringify(systemData, null, 2)}\n`;
    }

    prompt += `\nCâu hỏi hiện tại: ${currentMessage}\n`;
    prompt += '\nTrả lời dựa trên ngữ cảnh và dữ liệu trên:';

    return prompt;
  }
}
