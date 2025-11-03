import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { RABBITMQ_CONSTANTS } from 'src/common/constants';
import { ActionRequest, ActionResult } from 'src/common/interfaces/chat.interface';

@Injectable()
export class ActionExecutorService {
  constructor(
    @Inject(RABBITMQ_CONSTANTS.AUTH.name)
    private readonly authClient: ClientProxy,
    @Inject(RABBITMQ_CONSTANTS.BUSINESS.name)
    private readonly businessClient: ClientProxy,
    @Inject(RABBITMQ_CONSTANTS.GENERAL.name)
    private readonly generalClient: ClientProxy,
    @Inject(RABBITMQ_CONSTANTS.INVENTORY.name)
    private readonly inventoryClient: ClientProxy,
    @Inject(RABBITMQ_CONSTANTS.OPERATION.name)
    private readonly operationClient: ClientProxy,
  ) {}

  async executeAction(action: ActionRequest): Promise<ActionResult> {
    try {
      switch (action.type) {
        // Inventory actions
        case 'check_inventory':
          return await this.checkInventory(action.params);

        case 'get_all_warehouses':
          return await this.getAllWarehouses(action.params);

        // Purchase Order actions
        case 'get_purchase_order':
          return await this.getPurchaseOrder(action.params);

        case 'get_all_purchase_orders':
          return await this.getAllPurchaseOrders(action.params);

        case 'create_purchase_order':
          return await this.createPurchaseOrder(action.params);

        // Sales Order actions
        case 'get_sales_order':
          return await this.getSalesOrder(action.params);

        case 'get_all_sales_orders':
          return await this.getAllSalesOrders(action.params);

        case 'create_sales_order':
          return await this.createSalesOrder(action.params);

        // RFQ actions
        case 'get_rfq':
          return await this.getRFQ(action.params);

        case 'create_rfq':
          return await this.createRFQ(action.params);

        // Quotation actions
        case 'get_quotation':
          return await this.getQuotation(action.params);

        case 'create_quotation':
          return await this.createQuotation(action.params);

        // Item actions
        case 'get_item':
          return await this.getItem(action.params);

        case 'get_all_items':
          return await this.getAllItems(action.params);

        // Manufacturing actions
        case 'get_manufacture_order':
          return await this.getManufactureOrder(action.params);

        case 'get_all_manufacture_orders':
          return await this.getAllManufactureOrders(action.params);

        default:
          return {
            success: false,
            error: `Unknown action type: ${action.type}`,
          };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Action execution failed',
      };
    }
  }

  // ==================== INVENTORY ACTIONS ====================

  private async checkInventory(params: any): Promise<ActionResult> {
    const { itemId, warehouseId, amount } = params;

    const result = await firstValueFrom(
      this.inventoryClient.send('CHECK_INVENTORY', {
        itemId,
        warehouseId,
        amount,
      }),
    );

    return {
      success: true,
      data: result,
      message: `Inventory check completed for item ${itemId}`,
    };
  }

  private async getAllWarehouses(params: any): Promise<ActionResult> {
    const { companyId } = params;

    const result = await firstValueFrom(
      this.inventoryClient.send('GET_ALL_WAREHOUSES_IN_COMPANY', {
        companyId,
      }),
    );

    return {
      success: true,
      data: result,
      message: `Found ${result?.length || 0} warehouses`,
    };
  }

  // ==================== PURCHASE ORDER ACTIONS ====================

  private async getPurchaseOrder(params: any): Promise<ActionResult> {
    const { poId, poCode } = params;

    const pattern = poId ? 'GET_PO_BY_ID' : 'GET_PO_BY_CODE';
    const payload = poId ? { poId } : { poCode };

    const result = await firstValueFrom(this.businessClient.send(pattern, payload));

    return {
      success: true,
      data: result,
      message: `Found purchase order ${poId || poCode}`,
    };
  }

  private async getAllPurchaseOrders(params: any): Promise<ActionResult> {
    const { companyId } = params;

    const result = await firstValueFrom(
      this.businessClient.send('GET_ALL_PO_IN_COMPANY', { companyId }),
    );

    return {
      success: true,
      data: result,
      message: `Found ${result?.length || 0} purchase orders`,
    };
  }

  private async createPurchaseOrder(params: any): Promise<ActionResult> {
    const result = await firstValueFrom(
      this.businessClient.send('CREATE_PURCHASE_ORDER', params),
    );

    return {
      success: true,
      data: result,
      message: `Purchase order created successfully`,
    };
  }

  // ==================== SALES ORDER ACTIONS ====================

  private async getSalesOrder(params: any): Promise<ActionResult> {
    const { soId, soCode } = params;

    const pattern = soId ? 'GET_SO_BY_ID' : 'GET_SO_BY_CODE';
    const payload = soId ? { soId } : { soCode };

    const result = await firstValueFrom(this.businessClient.send(pattern, payload));

    return {
      success: true,
      data: result,
      message: `Found sales order ${soId || soCode}`,
    };
  }

  private async getAllSalesOrders(params: any): Promise<ActionResult> {
    const { companyId } = params;

    const result = await firstValueFrom(
      this.businessClient.send('GET_ALL_SO_IN_COMPANY', { companyId }),
    );

    return {
      success: true,
      data: result,
      message: `Found ${result?.length || 0} sales orders`,
    };
  }

  private async createSalesOrder(params: any): Promise<ActionResult> {
    const result = await firstValueFrom(
      this.businessClient.send('CREATE_SALES_ORDER', params),
    );

    return {
      success: true,
      data: result,
      message: `Sales order created successfully`,
    };
  }

  // ==================== RFQ ACTIONS ====================

  private async getRFQ(params: any): Promise<ActionResult> {
    const { rfqId } = params;

    const result = await firstValueFrom(
      this.businessClient.send('GET_RFQ_BY_ID', { rfqId }),
    );

    return {
      success: true,
      data: result,
      message: `Found RFQ ${rfqId}`,
    };
  }

  private async createRFQ(params: any): Promise<ActionResult> {
    const result = await firstValueFrom(this.businessClient.send('CREATE_RFQ', params));

    return {
      success: true,
      data: result,
      message: `RFQ created successfully`,
    };
  }

  // ==================== QUOTATION ACTIONS ====================

  private async getQuotation(params: any): Promise<ActionResult> {
    const { quotationId } = params;

    const result = await firstValueFrom(
      this.businessClient.send('GET_QUOTATION_BY_ID', { quotationId }),
    );

    return {
      success: true,
      data: result,
      message: `Found quotation ${quotationId}`,
    };
  }

  private async createQuotation(params: any): Promise<ActionResult> {
    const result = await firstValueFrom(
      this.businessClient.send('CREATE_QUOTATION', params),
    );

    return {
      success: true,
      data: result,
      message: `Quotation created successfully`,
    };
  }

  // ==================== ITEM ACTIONS ====================

  private async getItem(params: any): Promise<ActionResult> {
    const { itemId } = params;

    const result = await firstValueFrom(
      this.generalClient.send('GET_ITEM_BY_ID', { itemId }),
    );

    return {
      success: true,
      data: result,
      message: `Found item ${itemId}`,
    };
  }

  private async getAllItems(params: any): Promise<ActionResult> {
    const { companyId } = params;

    const result = await firstValueFrom(
      this.generalClient.send('GET_ALL_ITEMS_IN_COMPANY', { companyId }),
    );

    return {
      success: true,
      data: result,
      message: `Found ${result?.length || 0} items`,
    };
  }

  // ==================== MANUFACTURE ORDER ACTIONS ====================

  private async getManufactureOrder(params: any): Promise<ActionResult> {
    const { moId, moCode } = params;

    const pattern = moId ? 'GET_MO_BY_ID' : 'GET_MO_BY_CODE';
    const payload = moId ? { moId } : { moCode };

    const result = await firstValueFrom(this.operationClient.send(pattern, payload));

    return {
      success: true,
      data: result,
      message: `Found manufacture order ${moId || moCode}`,
    };
  }

  private async getAllManufactureOrders(params: any): Promise<ActionResult> {
    const { companyId } = params;

    const result = await firstValueFrom(
      this.operationClient.send('GET_ALL_MO_IN_COMPANY', { companyId }),
    );

    return {
      success: true,
      data: result,
      message: `Found ${result?.length || 0} manufacture orders`,
    };
  }
}
