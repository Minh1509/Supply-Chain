import { Injectable } from '@nestjs/common';
import { IntentType } from '../../common/enums/intent.enum';
import { InventoryActionService } from './inventory-action.service';
import { BusinessActionService } from './business-action.service';
import { OperationActionService } from './operation-action.service';

@Injectable()
export class ActionExecutorService {
  constructor(
    private readonly inventoryAction: InventoryActionService,
    private readonly businessAction: BusinessActionService,
    private readonly operationAction: OperationActionService,
  ) {}

  async fetchData(intent: IntentType, entities: any): Promise<any> {
    try {
      const startTime = Date.now();

      let result: any;

      switch (intent) {
        case IntentType.QUERY_INVENTORY:
          // Parallel fetch: inventory + item details
          const [inventory, itemDetails] = await Promise.all([
            this.inventoryAction.getInventory(entities),
            entities.itemId ? this.inventoryAction.getWarehouseList(entities.companyId || 1) : Promise.resolve(null),
          ]);
          result = { ...inventory, warehouses: itemDetails };
          break;

        case IntentType.QUERY_ORDER:
          result = entities.orderType === 'purchase' || entities.orderCode?.startsWith('PO')
            ? await this.businessAction.getPurchaseOrder(entities)
            : await this.businessAction.getSalesOrder(entities);
          break;

        case IntentType.QUERY_MANUFACTURE:
          result = await this.operationAction.getManufactureOrder(entities);
          break;

        case IntentType.REPORT:
          result = await this.handleReport(entities);
          break;

        default:
          result = null;
      }

      const responseTime = Date.now() - startTime;
      if (responseTime > 5000) {
        console.warn(`⚠️ Slow fetchData: ${responseTime}ms for intent ${intent}`);
      } else {
        console.log(`✅ fetchData time: ${responseTime}ms for intent ${intent}`);
      }

      return result;
    } catch (error) {
      console.error('Fetch error:', error.message);
      return null;
    }
  }

  async executeAction(intent: IntentType, entities: any): Promise<any> {
    try {
      switch (intent) {
        case IntentType.CREATE_TICKET:
          return await this.handleCreateTicket(entities);

        default:
          return { success: false, message: 'Hành động không được hỗ trợ' };
      }
    } catch (error) {
      console.error('Execute action error:', error.message);
      return { success: false, message: 'Có lỗi xảy ra khi thực hiện hành động' };
    }
  }

  private async handleReport(entities: any): Promise<any> {
    const reportType = entities.reportType || 'inventory';

    switch (reportType) {
      case 'inventory':
        return await this.inventoryAction.getReport(entities);
      case 'sales':
        return await this.businessAction.getSalesReport(entities);
      case 'purchase':
        return await this.businessAction.getPurchaseReport(entities);
      case 'manufacture':
        return await this.operationAction.getManufactureReport(entities);
      default:
        return await this.inventoryAction.getReport(entities);
    }
  }

  private async handleCreateTicket(entities: any): Promise<any> {
    const ticketType = entities.ticketType || 'issue';

    if (ticketType === 'issue' || ticketType === 'xuất') {
      return await this.inventoryAction.createIssueTicket(entities);
    } else if (ticketType === 'receive' || ticketType === 'nhập') {
      return await this.inventoryAction.createReceiveTicket(entities);
    }

    return { success: false, message: 'Loại phiếu không hợp lệ' };
  }
}
