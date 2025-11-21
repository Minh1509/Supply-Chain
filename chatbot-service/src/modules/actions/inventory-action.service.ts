import { Injectable } from '@nestjs/common';
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';

@Injectable()
export class InventoryActionService {
  constructor(private readonly rabbitmq: RabbitmqService) {}

  async getInventory(entities: any): Promise<any> {
    try {
      const payload = {
        pattern: 'inventory.get_all_inventory',
        data: {
          companyId: entities.companyId || 1,
          itemId: entities.itemId,
          warehouseId: entities.warehouseId,
        },
      };

      const response = await this.rabbitmq.send('inventory_queue', payload);
      return response ? this.formatInventoryResponse(response, entities) : this.mockInventoryData(entities);
    } catch (error) {
      console.error('Get inventory error:', error.message);
      return this.mockInventoryData(entities);
    }
  }

  async getReport(entities: any): Promise<any> {
    try {
      const payload = {
        pattern: 'receive_ticket.get_monthly_report',
        data: {
          companyId: entities.companyId || 1,
          type: entities.type || 'all',
        },
      };

      const response = await this.rabbitmq.send('inventory_queue', payload);
      return response ? this.formatReportResponse(response) : this.mockReportData();
    } catch (error) {
      console.error('Get inventory report error:', error.message);
      return this.mockReportData();
    }
  }

  async createIssueTicket(entities: any): Promise<any> {
    try {
      const payload = {
        pattern: 'issue_ticket.create',
        data: {
          issueTicket: {
            companyId: entities.companyId || 1,
            warehouseId: entities.warehouseId,
            reason: entities.reason || 'Xuất kho theo yêu cầu',
            note: entities.note || '',
          },
          issueTicketDetails: [{ itemId: entities.itemId, quantity: entities.quantity }],
        },
      };

      const response = await this.rabbitmq.send('inventory_queue', payload);
      return this.formatTicketResponse(response, 'issue');
    } catch (error) {
      console.error('Create issue ticket error:', error.message);
      return { success: false, message: 'Không thể tạo phiếu xuất kho' };
    }
  }

  async createReceiveTicket(entities: any): Promise<any> {
    try {
      const payload = {
        pattern: 'receive_ticket.create',
        data: {
          receiveTicket: {
            companyId: entities.companyId || 1,
            warehouseId: entities.warehouseId,
            source: entities.source || 'Purchase Order',
            note: entities.note || '',
          },
          receiveTicketDetails: [{ itemId: entities.itemId, quantity: entities.quantity }],
        },
      };

      const response = await this.rabbitmq.send('inventory_queue', payload);
      return this.formatTicketResponse(response, 'receive');
    } catch (error) {
      console.error('Create receive ticket error:', error.message);
      return { success: false, message: 'Không thể tạo phiếu nhập kho' };
    }
  }

  async getWarehouseList(companyId: number): Promise<any> {
    try {
      const payload = {
        pattern: 'warehouse.get_all_in_company',
        data: {
          companyId: companyId || 1,
        },
      };

      const response = await this.rabbitmq.send('inventory_queue', payload);
      return response || [];
    } catch (error) {
      console.error('Get warehouse list error:', error.message);
      return [];
    }
  }

  private formatInventoryResponse(response: any, entities: any): any {
    return Array.isArray(response) && response.length > 0
      ? {
          items: response.map((inv) => ({
            itemId: inv.itemId,
            warehouseId: inv.warehouseId,
            quantity: inv.quantity,
            available: inv.quantity - (inv.onDemand || 0),
          })),
          total: response.length,
        }
      : this.mockInventoryData(entities);
  }

  private formatReportResponse(response: any): any {
    return response?.length > 0
      ? {
          data: response,
          summary: {
            totalItems: response.length,
            totalQuantity: response.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0),
          },
        }
      : this.mockReportData();
  }

  private formatTicketResponse(response: any, type: string): any {
    return response?.id
      ? {
          success: true,
          ticketId: response.id,
          ticketCode: response.code || `${type.toUpperCase()}-${response.id}`,
          message: `Đã tạo phiếu ${type === 'issue' ? 'xuất' : 'nhập'} kho thành công`,
        }
      : { success: false, message: 'Không thể tạo phiếu' };
  }

  private mockInventoryData(entities: any): any {
    return {
      items: [
        {
          itemId: entities.itemId || 1,
          warehouseId: entities.warehouseId || 1,
          quantity: 150,
          available: 130,
        },
      ],
      total: 1,
      note: 'Dữ liệu mẫu',
    };
  }

  private mockReportData(): any {
    return {
      data: [],
      summary: { totalItems: 0, totalQuantity: 0 },
      note: 'Dữ liệu mẫu',
    };
  }
}
