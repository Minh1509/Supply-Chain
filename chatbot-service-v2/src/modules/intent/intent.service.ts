import { Injectable } from '@nestjs/common';
import { IntentType } from '../../common/enums/intent.enum';

@Injectable()
export class IntentService {
  private readonly intentPatterns = {
    [IntentType.QUERY_INVENTORY]: [
      /tồn kho/i,
      /còn lại/i,
      /số lượng.*kho/i,
      /kiểm tra.*kho/i,
      /inventory/i,
    ],
    [IntentType.QUERY_ORDER]: [/đơn hàng/i, /order/i, /kiểm tra.*đơn/i, /trạng thái.*đơn/i],
    [IntentType.QUERY_MANUFACTURE]: [/sản xuất/i, /lệnh sản xuất/i, /manufacture/i, /quy trình/i],
    [IntentType.CREATE_TICKET]: [
      /tạo phiếu/i,
      /xuất kho/i,
      /nhập kho/i,
      /phiếu xuất/i,
      /phiếu nhập/i,
    ],
    [IntentType.REPORT]: [/báo cáo/i, /report/i, /thống kê/i, /tổng hợp/i],
    [IntentType.GREETING]: [/^(xin chào|chào|hello|hi)/i, /bạn là ai/i, /giúp gì/i],
  };

  async classify(message: string): Promise<{ intent: IntentType; entities: any }> {
    for (const [intent, patterns] of Object.entries(this.intentPatterns)) {
      if (patterns.some((pattern) => pattern.test(message))) {
        const entities = this.extractEntities(message);
        return { intent: intent as IntentType, entities };
      }
    }

    return { intent: IntentType.UNKNOWN, entities: {} };
  }

  private extractEntities(message: string): any {
    const entities: any = {
      companyId: 1,
    };

    const itemMatch = message.match(/(?:sản phẩm|item|hàng)\s+(\w+)/i);
    if (itemMatch) {
      entities.itemName = itemMatch[1];
      entities.itemId = this.getItemIdFromName(itemMatch[1]);
    }

    const warehouseMatch = message.match(/kho\s+(\w+)/i);
    if (warehouseMatch) {
      entities.warehouseName = warehouseMatch[1];
      entities.warehouseId = this.getWarehouseIdFromName(warehouseMatch[1]);
    }

    const quantityMatch = message.match(/(\d+)\s*(cái|chiếc|kg|tấn|đơn vị)?/i);
    if (quantityMatch) {
      entities.quantity = parseInt(quantityMatch[1]);
    }

    const orderMatch = message.match(/(SO|PO|MO|DO)-?(\d+)/i);
    if (orderMatch) {
      entities.orderCode = `${orderMatch[1].toUpperCase()}-${orderMatch[2]}`;
      entities.orderId = parseInt(orderMatch[2]);
      entities.orderType = this.getOrderType(orderMatch[1]);
    }

    const monthMatch = message.match(/tháng\s+(\d+)/i);
    if (monthMatch) {
      entities.month = parseInt(monthMatch[1]);
    }

    const yearMatch = message.match(/năm\s+(\d{4})/i);
    if (yearMatch) {
      entities.year = parseInt(yearMatch[1]);
    }

    if (message.match(/xuất kho/i)) {
      entities.ticketType = 'issue';
    } else if (message.match(/nhập kho/i)) {
      entities.ticketType = 'receive';
    }

    if (message.match(/báo cáo.*bán hàng|sales.*report/i)) {
      entities.reportType = 'sales';
    } else if (message.match(/báo cáo.*mua hàng|purchase.*report/i)) {
      entities.reportType = 'purchase';
    } else if (message.match(/báo cáo.*sản xuất|manufacture.*report/i)) {
      entities.reportType = 'manufacture';
    } else if (message.match(/báo cáo.*tồn kho|inventory.*report/i)) {
      entities.reportType = 'inventory';
    }

    return entities;
  }

  private getItemIdFromName(name: string): number {
    const itemMap: Record<string, number> = {
      ABC: 1,
      XYZ: 2,
      A: 1,
      B: 2,
      C: 3,
    };
    return itemMap[name.toUpperCase()] || 1;
  }

  private getWarehouseIdFromName(name: string): number {
    const warehouseMap: Record<string, number> = {
      'Hà Nội': 1,
      HN: 1,
      Hanoi: 1,
      'TP.HCM': 2,
      HCM: 2,
      HCMC: 2,
      'Đà Nẵng': 3,
      DN: 3,
    };
    return warehouseMap[name] || 1;
  }

  private getOrderType(prefix: string): string {
    const typeMap: Record<string, string> = {
      SO: 'sales',
      PO: 'purchase',
      MO: 'manufacture',
      DO: 'delivery',
    };
    return typeMap[prefix.toUpperCase()] || 'sales';
  }
}
