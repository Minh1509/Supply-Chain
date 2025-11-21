import { Injectable } from '@nestjs/common';
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';

@Injectable()
export class BusinessActionService {
  constructor(private readonly rabbitmq: RabbitmqService) {}

  async getSalesOrder(entities: any): Promise<any> {
    try {
      let pattern = 'so.get_by_id';
      let data: any = { soId: entities.orderId };

      if (entities.orderCode) {
        pattern = 'so.get_by_code';
        data = { soCode: entities.orderCode };
      }

      const payload = {
        pattern,
        data,
      };

      const response = await this.rabbitmq.send('business_queue', payload);
      return this.formatSalesOrderResponse(response);
    } catch (error) {
      console.error('Get sales order error:', error.message);
      return this.mockOrderData(entities);
    }
  }

  async getPurchaseOrder(entities: any): Promise<any> {
    try {
      let pattern = 'po.get_by_id';
      let data: any = { poId: entities.orderId };

      if (entities.orderCode) {
        pattern = 'po.get_by_code';
        data = { poCode: entities.orderCode };
      }

      const payload = {
        pattern,
        data,
      };

      const response = await this.rabbitmq.send('business_queue', payload);
      return this.formatPurchaseOrderResponse(response);
    } catch (error) {
      console.error('Get purchase order error:', error.message);
      return this.mockOrderData(entities);
    }
  }

  async getSalesReport(entities: any): Promise<any> {
    try {
      const payload = {
        pattern: 'so.monthly_report',
        data: {
          companyId: entities.companyId || 1,
        },
      };

      const response = await this.rabbitmq.send('business_queue', payload);
      return this.formatSalesReportResponse(response);
    } catch (error) {
      console.error('Get sales report error:', error.message);
      return this.mockSalesReport();
    }
  }

  async getPurchaseReport(entities: any): Promise<any> {
    try {
      const payload = {
        pattern: 'po.monthly_report',
        data: {
          companyId: entities.companyId || 1,
        },
      };

      const response = await this.rabbitmq.send('business_queue', payload);
      return this.formatPurchaseReportResponse(response);
    } catch (error) {
      console.error('Get purchase report error:', error.message);
      return this.mockPurchaseReport();
    }
  }

  async getInvoice(entities: any): Promise<any> {
    try {
      const payload = {
        pattern: 'invoice.get_pdf_by_so_id',
        data: {
          soId: entities.orderId,
        },
      };

      const response = await this.rabbitmq.send('business_queue', payload);
      return response;
    } catch (error) {
      console.error('Get invoice error:', error.message);
      return { success: false, message: 'Không tìm thấy hóa đơn' };
    }
  }

  private formatSalesOrderResponse(response: any): any {
    if (response && response.id) {
      return {
        orderId: response.id,
        orderCode: response.code,
        status: response.status,
        customerCompanyId: response.customerCompanyId,
        totalAmount: response.totalAmount,
        createdAt: response.createdAt,
        details: response.salesOrderDetails || [],
      };
    }
    return null;
  }

  private formatPurchaseOrderResponse(response: any): any {
    if (response && response.id) {
      return {
        orderId: response.id,
        orderCode: response.code,
        status: response.status,
        supplierCompanyId: response.supplierCompanyId,
        totalAmount: response.totalAmount,
        createdAt: response.createdAt,
        details: response.purchaseOrderDetails || [],
      };
    }
    return null;
  }

  private formatSalesReportResponse(response: any): any {
    if (response && Array.isArray(response)) {
      return {
        data: response,
        summary: {
          totalOrders: response.length,
          totalRevenue: response.reduce((sum, item) => sum + (item.totalAmount || 0), 0),
        },
      };
    }
    return this.mockSalesReport();
  }

  private formatPurchaseReportResponse(response: any): any {
    if (response && Array.isArray(response)) {
      return {
        data: response,
        summary: {
          totalOrders: response.length,
          totalSpent: response.reduce((sum, item) => sum + (item.totalAmount || 0), 0),
        },
      };
    }
    return this.mockPurchaseReport();
  }

  private mockOrderData(entities: any): any {
    return {
      orderId: entities.orderId || 1,
      orderCode: entities.orderCode || 'SO-001',
      status: 'Processing',
      totalAmount: 50000000,
      createdAt: new Date(),
      note: 'Dữ liệu mẫu - Service chưa kết nối',
    };
  }

  private mockSalesReport(): any {
    return {
      data: [],
      summary: {
        totalOrders: 0,
        totalRevenue: 0,
      },
      note: 'Dữ liệu mẫu - Service chưa kết nối',
    };
  }

  private mockPurchaseReport(): any {
    return {
      data: [],
      summary: {
        totalOrders: 0,
        totalSpent: 0,
      },
      note: 'Dữ liệu mẫu - Service chưa kết nối',
    };
  }
}
