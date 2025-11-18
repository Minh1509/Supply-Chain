import { Injectable } from '@nestjs/common';
import { RabbitmqService } from '../rabbitmq/rabbitmq.service';

@Injectable()
export class GeneralActionService {
  constructor(private readonly rabbitmq: RabbitmqService) {}

  async getItem(entities: any): Promise<any> {
    try {
      const response = await this.rabbitmq.send('item.get_by_id', { itemId: entities.itemId });
      return this.formatItemResponse(response);
    } catch (error) {
      return null;
    }
  }

  async getProduct(entities: any): Promise<any> {
    try {
      const response = await this.rabbitmq.send('product.get_by_id', { productId: entities.productId });
      return this.formatProductResponse(response);
    } catch (error) {
      return null;
    }
  }

  async getManufacturePlant(entities: any): Promise<any> {
    try {
      const response = await this.rabbitmq.send('manufacture_plant.get_all_in_company', {
        companyId: entities.companyId || 1,
      });
      return response || [];
    } catch (error) {
      return [];
    }
  }

  async getManufactureLine(entities: any): Promise<any> {
    try {
      const response = await this.rabbitmq.send('manufacture_line.get_all_in_plant', {
        plantId: entities.plantId,
      });
      return response || [];
    } catch (error) {
      return [];
    }
  }

  private formatItemResponse(response: any): any {
    return response?.id
      ? {
          itemId: response.id,
          itemCode: response.code,
          itemName: response.name,
          type: response.type,
          unit: response.unit,
        }
      : null;
  }

  private formatProductResponse(response: any): any {
    return response?.id
      ? {
          productId: response.id,
          productCode: response.code,
          productName: response.name,
          category: response.category,
          price: response.price,
        }
      : null;
  }
}
