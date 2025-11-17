import { Injectable } from '@nestjs/common';
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';

@Injectable()
export class GeneralActionService {
  constructor(private readonly rabbitmq: RabbitmqService) {}

  async getItem(entities: any): Promise<any> {
    try {
      const payload = {
        pattern: 'item.get_by_id',
        data: {
          itemId: entities.itemId,
        },
      };

      const response = await this.rabbitmq.send('general_queue', payload);
      return this.formatItemResponse(response);
    } catch (error) {
      console.error('Get item error:', error.message);
      return null;
    }
  }

  async getProduct(entities: any): Promise<any> {
    try {
      const payload = {
        pattern: 'product.get_by_id',
        data: {
          productId: entities.productId,
        },
      };

      const response = await this.rabbitmq.send('general_queue', payload);
      return this.formatProductResponse(response);
    } catch (error) {
      console.error('Get product error:', error.message);
      return null;
    }
  }

  async getManufacturePlant(entities: any): Promise<any> {
    try {
      const payload = {
        pattern: 'manufacture_plant.get_all_in_company',
        data: {
          companyId: entities.companyId || 1,
        },
      };

      const response = await this.rabbitmq.send('general_queue', payload);
      return response;
    } catch (error) {
      console.error('Get manufacture plant error:', error.message);
      return [];
    }
  }

  async getManufactureLine(entities: any): Promise<any> {
    try {
      const payload = {
        pattern: 'manufacture_line.get_all_in_plant',
        data: {
          plantId: entities.plantId,
        },
      };

      const response = await this.rabbitmq.send('general_queue', payload);
      return response;
    } catch (error) {
      console.error('Get manufacture line error:', error.message);
      return [];
    }
  }

  private formatItemResponse(response: any): any {
    if (response && response.id) {
      return {
        itemId: response.id,
        itemCode: response.code,
        itemName: response.name,
        type: response.type,
        unit: response.unit,
        description: response.description,
      };
    }
    return null;
  }

  private formatProductResponse(response: any): any {
    if (response && response.id) {
      return {
        productId: response.id,
        productCode: response.code,
        productName: response.name,
        category: response.category,
        price: response.price,
        description: response.description,
      };
    }
    return null;
  }
}
