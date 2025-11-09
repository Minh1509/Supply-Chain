import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { RABBITMQ_CONSTANTS } from 'src/common/constants';
import { RABBITMQ_PATTERNS } from 'src/common/constants/rabbitmq-patterns';
import { RabbitMQUtil } from 'src/common/utils/rabbitmq.util';

@Injectable()
export class DataEnrichmentService {
  private readonly REQUEST_TIMEOUT = 30000;

  constructor(
    @Inject(RABBITMQ_CONSTANTS.GENERAL.name)
    private readonly generalClient: ClientProxy,
  ) {}

  private async enrichOrderDetails(details: any[]): Promise<any[]> {
    return Promise.all(
      details.map(async (detail) => {
        if (!detail.itemId) return detail;

        const item = await RabbitMQUtil.sendRequest(
          this.generalClient,
          RABBITMQ_PATTERNS.GENERAL.ITEM.GET_BY_ID,
          { itemId: detail.itemId },
          this.REQUEST_TIMEOUT,
        );

        if (item) {
          return {
            ...detail,
            itemName: item.itemName,
            itemCode: item.itemCode,
            uom: item.uom,
          };
        }
        return detail;
      }),
    );
  }

  async enrichPurchaseOrder(po: any): Promise<any> {
    if (!po?.purchaseOrderDetails) return po;
    return {
      ...po,
      purchaseOrderDetails: await this.enrichOrderDetails(po.purchaseOrderDetails),
    };
  }

  async enrichSalesOrder(so: any): Promise<any> {
    if (!so?.salesOrderDetails) return so;
    return {
      ...so,
      salesOrderDetails: await this.enrichOrderDetails(so.salesOrderDetails),
    };
  }

  async enrichInventory(inventory: any | any[]): Promise<any> {
    if (Array.isArray(inventory)) {
      return Promise.all(inventory.map((inv) => this.enrichSingleInventory(inv)));
    }
    return this.enrichSingleInventory(inventory);
  }

  private async enrichSingleInventory(inventory: any): Promise<any> {
    if (!inventory?.itemId) return inventory;

    const item = await RabbitMQUtil.sendRequest(
      this.generalClient,
      RABBITMQ_PATTERNS.GENERAL.ITEM.GET_BY_ID,
      { itemId: inventory.itemId },
      this.REQUEST_TIMEOUT,
    );

    if (item) {
      return {
        ...inventory,
        itemName: item.itemName,
        itemCode: item.itemCode,
        uom: item.uom,
      };
    }
    return inventory;
  }
}
