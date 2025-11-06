import { Injectable } from '@nestjs/common';
import { SYSTEM_PROMPTS } from 'src/common/constants';

@Injectable()
export class PromptService {
  getSystemPrompt(context: { companyId?: string; userId?: string }): string {
    return `Bạn là trợ lý AI thông minh cho quản lý chuỗi cung ứng. Nhiệm vụ của bạn là:

1. **Hiểu và trả lời mọi câu hỏi** của người dùng một cách tự nhiên, không chỉ giới hạn trong các chủ đề chuỗi cung ứng
2. **Phân tích intent chính xác** để đưa ra phản hồi phù hợp
3. **Trả lời bằng tiếng Việt** tự nhiên, thân thiện như người thật
4. **Cung cấp thông tin hữu ích** và có thể hành động được

**Ngữ cảnh:**
- Mã công ty: ${context.companyId || 'Không xác định'}
- Mã người dùng: ${context.userId || 'Không xác định'}

**Quy tắc trả lời:**
- Luôn trả lời bằng tiếng Việt tự nhiên
- Với câu hỏi về chuỗi cung ứng: đưa thông tin chính xác từ hệ thống
- Với câu hỏi chung: trả lời một cách hữu ích và thân thiện
- Nếu không hiểu: hỏi lại để làm rõ
- Giữ thái độ chuyên nghiệp nhưng gần gũi`;
  }

  getIntentRecognitionPrompt(message: string, conversationHistory: any[] = []): string {
    const history = conversationHistory.slice(-3).map(msg => `${msg.role}: ${msg.content}`).join('\n');
    
    return `Phân tích câu hỏi tiếng Việt sau và xác định intent trong ngữ cảnh chuỗi cung ứng.
Câu hỏi: "${message}"
${history ? `Lịch sử hội thoại:\n${history}` : ''}

Các intent có thể:
- inventory.check: Kiểm tra tồn kho, trạng thái hàng hóa
- order.get_status: Xem trạng thái đơn hàng (mua/bán)
- order.create: Tạo đơn hàng mới
- supplier.find: Tìm nhà cung cấp
- item.find: Tìm sản phẩm/mặt hàng
- warehouse.check: Xem thông tin kho
- report.view: Xem báo cáo
- general.chat: Trò chuyện thông thường, chào hỏi, cảm ơn, v.v.

Trả về JSON:
{
  "intent": "intent_name",
  "confidence": 0.0-1.0,
  "entities": {
    "itemId": "mã sản phẩm",
    "orderId": "mã đơn hàng", 
    "warehouseId": "mã kho",
    "supplierId": "mã nhà cung cấp",
    "quantity": "số lượng",
    "date": "ngày tháng",
    "status": "trạng thái"
  }
}

Lưu ý: Chỉ trả về JSON, không thêm text khác.`;
  }

  buildContextualPrompt(
    currentMessage: string,
    conversationHistory: any[],
    additionalContext?: string,
  ): string {
    let prompt = 'Previous conversation:\n';

    for (const msg of conversationHistory.slice(-5)) {
      prompt += `${msg.role}: ${msg.content}\n`;
    }

    if (additionalContext) {
      prompt += `\nAdditional context: ${additionalContext}\n`;
    }

    prompt += `\nCurrent message: ${currentMessage}\n`;
    prompt += '\nProvide a helpful response:';

    return prompt;
  }

  formatInventoryQuery(itemId: number, warehouseId?: number): string {
    if (warehouseId) {
      return `Check inventory for item ${itemId} in warehouse ${warehouseId}`;
    }
    return `Check inventory for item ${itemId} in all warehouses`;
  }

  formatOrderQuery(orderType: string, orderId: string): string {
    return `Get ${orderType} with ID/Code: ${orderId}`;
  }

  buildConfirmationPrompt(action: string, details: any): string {
    return `You are about to perform: ${action}\n\nDetails:\n${JSON.stringify(details, null, 2)}\n\nDo you want to proceed? (yes/no)`;
  }

  formatSuccessMessage(action: string, result: any): string {
    return `Successfully completed: ${action}\n\nResult: ${JSON.stringify(result, null, 2)}`;
  }

  formatErrorMessage(error: string): string {
    return `Error: ${error}`;
  }

  formatResponseTemplate(intent: string, data: any, error?: string): string {
    if (error) {
      return `❌ Lỗi: ${error}`;
    }

    switch (intent) {
      case 'inventory.check':
        return this.formatInventoryResponse(data);
      case 'order.view':
        return this.formatOrderResponse(data);
      case 'order.create':
        return this.formatOrderCreatedResponse(data);
      case 'report.generate':
        return this.formatReportResponse(data);
      case 'warehouse.list':
        return this.formatWarehouseListResponse(data);
      case 'supplier.list':
        return this.formatSupplierListResponse(data);
      case 'item.search':
        return this.formatItemSearchResponse(data);
      default:
        return `✅ Hoàn thành: ${JSON.stringify(data, null, 2)}`;
    }
  }

  private formatInventoryResponse(data: any): string {
    if (Array.isArray(data)) {
      return `📦 Tồn kho:\n${data.map(item => 
        `• ${item.itemName || item.name}: ${item.quantity || item.availableQuantity} ${item.unit || ''}`
      ).join('\n')}`;
    }
    return `📦 Tồn kho: ${data.quantity || data.availableQuantity} ${data.unit || ''}`;
  }

  private formatOrderResponse(data: any): string {
    return `📋 Đơn hàng ${data.orderId || data.id}:\n` +
           `• Trạng thái: ${data.status || 'Unknown'}\n` +
           `• Tổng tiền: ${data.totalAmount || data.amount || 'N/A'}\n` +
           `• Ngày tạo: ${data.createdAt || data.orderDate || 'N/A'}`;
  }

  private formatOrderCreatedResponse(data: any): string {
    return `✅ Đơn hàng đã được tạo thành công!\n` +
           `• Mã đơn: ${data.orderId || data.id}\n` +
           `• Trạng thái: ${data.status || 'Created'}\n` +
           `• Tổng tiền: ${data.totalAmount || data.amount || 'N/A'}`;
  }

  private formatReportResponse(data: any): string {
    return `📊 Báo cáo:\n${JSON.stringify(data, null, 2)}`;
  }

  private formatWarehouseListResponse(data: any): string {
    if (Array.isArray(data)) {
      return `🏭 Danh sách kho:\n${data.map(wh => 
        `• ${wh.name} (${wh.code || wh.id}): ${wh.location || wh.address || ''}`
      ).join('\n')}`;
    }
    return `🏭 Kho: ${data.name || data.code || 'Unknown'}`;
  }

  private formatSupplierListResponse(data: any): string {
    if (Array.isArray(data)) {
      return `👥 Danh sách nhà cung cấp:\n${data.map(supplier => 
        `• ${supplier.name} (${supplier.code || supplier.id}): ${supplier.contact || ''}`
      ).join('\n')}`;
    }
    return `👥 Nhà cung cấp: ${data.name || data.code || 'Unknown'}`;
  }

  private formatItemSearchResponse(data: any): string {
    if (Array.isArray(data)) {
      return `🔍 Kết quả tìm kiếm:\n${data.map(item => 
        `• ${item.name} (${item.code || item.id}): ${item.description || ''}`
      ).join('\n')}`;
    }
    return `🔍 Sản phẩm: ${data.name || data.code || 'Unknown'}`;
  }
}
