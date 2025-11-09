import { Injectable } from '@nestjs/common';
import { extractEntityFromMessage } from 'src/common/knowledge-base/domain-vocabulary';

@Injectable()
export class EntityExtractionService {
  extractEntities(message: string, llmEntities: Record<string, any>): Record<string, any> {
    const entities: Record<string, any> = { ...llmEntities };

    this.extractItemCode(message, entities);
    this.extractOrderCode(message, entities);
    this.extractWarehouseName(message, entities);
    this.extractQuantity(message, entities);
    this.extractNumbers(message, entities);

    return entities;
  }

  private extractItemCode(message: string, entities: Record<string, any>): void {
    if (entities.itemCode || entities.itemId) return;

    const itemCodePattern = /I\d{9,}/i;
    const match = message.match(itemCodePattern);
    if (match) {
      entities.itemCode = match[0];
    }
  }

  private extractOrderCode(message: string, entities: Record<string, any>): void {
    if (entities.orderCode || entities.poCode || entities.soCode) return;

    const poPattern = /PO-?\d{4}-?\d{3,}/i;
    const soPattern = /SO-?\d{4}-?\d{3,}/i;
    const moPattern = /MO-?\d{4}-?\d{3,}/i;
    const rfqPattern = /RFQ-?\d{4}-?\d{3,}/i;
    const doPattern = /DO-?\d{4}-?\d{3,}/i;

    const poMatch = message.match(poPattern);
    if (poMatch) {
      entities.poCode = poMatch[0].replace(/-/g, '-');
      entities.orderCode = entities.poCode;
    }

    const soMatch = message.match(soPattern);
    if (soMatch) {
      entities.soCode = soMatch[0].replace(/-/g, '-');
      entities.orderCode = entities.soCode;
    }

    const moMatch = message.match(moPattern);
    if (moMatch) {
      entities.moCode = moMatch[0].replace(/-/g, '-');
    }

    const rfqMatch = message.match(rfqPattern);
    if (rfqMatch) {
      entities.rfqCode = rfqMatch[0].replace(/-/g, '-');
    }

    const doMatch = message.match(doPattern);
    if (doMatch) {
      entities.doCode = doMatch[0].replace(/-/g, '-');
    }
  }

  private extractWarehouseName(message: string, entities: Record<string, any>): void {
    if (entities.warehouseId || entities.warehouseName) return;

    const commonWarehouses = ['Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ'];
    for (const wh of commonWarehouses) {
      if (message.includes(wh)) {
        entities.warehouseName = wh;
        break;
      }
    }
  }

  private extractQuantity(message: string, entities: Record<string, any>): void {
    if (entities.quantity) return;

    const quantityPatterns = [
      /(\d+(?:\.\d+)?)\s*(?:units?|cái|chiếc|kg|tấn|tạ|yến)/i,
      /(\d+(?:\.\d+)?)\s*(?:số lượng|số)/i,
      /(?:số lượng|số)\s*(\d+(?:\.\d+)?)/i,
    ];

    for (const pattern of quantityPatterns) {
      const match = message.match(pattern);
      if (match) {
        entities.quantity = parseFloat(match[1]);
        break;
      }
    }
  }

  private extractNumbers(message: string, entities: Record<string, any>): void {
    if (!entities.itemId && !entities.warehouseId && !entities.orderId) {
      const numberPattern = /\b(\d{4,})\b/g;
      const matches = message.match(numberPattern);
      if (matches && matches.length > 0) {
        const numbers = matches.map(m => parseInt(m));
        if (numbers.length === 1 && numbers[0] < 100000) {
          if (!entities.itemId && !entities.warehouseId) {
            entities.itemId = numbers[0];
          }
        }
      }
    }
  }
}

