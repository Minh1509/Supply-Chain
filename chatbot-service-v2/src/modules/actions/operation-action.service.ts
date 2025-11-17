import { Injectable } from '@nestjs/common';
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';

@Injectable()
export class OperationActionService {
  constructor(private readonly rabbitmq: RabbitmqService) {}

  async getManufactureOrder(entities: any): Promise<any> {
    try {
      let pattern = 'manufacture_order.get_by_id';
      let data: any = { moId: entities.orderId };

      if (entities.orderCode) {
        pattern = 'manufacture_order.get_by_code';
        data = { moCode: entities.orderCode };
      }

      const payload = {
        pattern,
        data,
      };

      const response = await this.rabbitmq.send('operation_queue', payload);
      return this.formatManufactureOrderResponse(response);
    } catch (error) {
      console.error('Get manufacture order error:', error.message);
      return this.mockManufactureData(entities);
    }
  }

  async getManufactureReport(entities: any): Promise<any> {
    try {
      const payload = {
        pattern: 'manufacture_order.monthly_report',
        data: {
          companyId: entities.companyId || 1,
          type: entities.type || 'all',
        },
      };

      const response = await this.rabbitmq.send('operation_queue', payload);
      return this.formatManufactureReportResponse(response);
    } catch (error) {
      console.error('Get manufacture report error:', error.message);
      return this.mockManufactureReport();
    }
  }

  async getBOM(entities: any): Promise<any> {
    try {
      const payload = {
        pattern: 'bom.get_by_item',
        data: {
          itemId: entities.itemId,
        },
      };

      const response = await this.rabbitmq.send('operation_queue', payload);
      return this.formatBOMResponse(response);
    } catch (error) {
      console.error('Get BOM error:', error.message);
      return null;
    }
  }

  async getDeliveryOrder(entities: any): Promise<any> {
    try {
      const payload = {
        pattern: 'delivery_order.get_by_id',
        data: {
          doId: entities.orderId,
        },
      };

      const response = await this.rabbitmq.send('operation_queue', payload);
      return this.formatDeliveryOrderResponse(response);
    } catch (error) {
      console.error('Get delivery order error:', error.message);
      return null;
    }
  }

  private formatManufactureOrderResponse(response: any): any {
    if (response && response.id) {
      return {
        orderId: response.id,
        orderCode: response.code,
        status: response.status,
        itemId: response.itemId,
        quantity: response.quantity,
        startDate: response.startDate,
        endDate: response.endDate,
        manufacturePlantId: response.manufacturePlantId,
        manufactureLineId: response.manufactureLineId,
      };
    }
    return null;
  }

  private formatManufactureReportResponse(response: any): any {
    if (response && Array.isArray(response)) {
      return {
        data: response,
        summary: {
          totalOrders: response.length,
          totalQuantity: response.reduce((sum, item) => sum + (item.quantity || 0), 0),
        },
      };
    }
    return this.mockManufactureReport();
  }

  private formatBOMResponse(response: any): any {
    if (response && response.id) {
      return {
        bomId: response.id,
        itemId: response.itemId,
        details: response.bomDetails || [],
      };
    }
    return null;
  }

  private formatDeliveryOrderResponse(response: any): any {
    if (response && response.id) {
      return {
        orderId: response.id,
        orderCode: response.code,
        status: response.status,
        deliveryDate: response.deliveryDate,
        details: response.deliveryOrderDetails || [],
      };
    }
    return null;
  }

  private mockManufactureData(entities: any): any {
    return {
      orderId: entities.orderId || 1,
      orderCode: entities.orderCode || 'MO-001',
      status: 'In Progress',
      quantity: 100,
      startDate: new Date(),
      note: 'Dữ liệu mẫu - Service chưa kết nối',
    };
  }

  private mockManufactureReport(): any {
    return {
      data: [],
      summary: {
        totalOrders: 0,
        totalQuantity: 0,
      },
      note: 'Dữ liệu mẫu - Service chưa kết nối',
    };
  }
}
