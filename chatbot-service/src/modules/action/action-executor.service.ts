import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { RABBITMQ_CONSTANTS } from 'src/common/constants';
import { RABBITMQ_PATTERNS } from 'src/common/constants/rabbitmq-patterns';
import { ActionRequest, ActionResult } from 'src/common/interfaces/chat.interface';
import { validateAction } from 'src/common/knowledge-base/business-rules';
import { RabbitMQUtil } from 'src/common/utils/rabbitmq.util';

@Injectable()
export class ActionExecutorService {
  private readonly logger = new Logger(ActionExecutorService.name);
  private readonly REQUEST_TIMEOUT = 30000;

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
      const validation = validateAction(action.type, action.params);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.errors.join(', '),
        };
      }

      const preCheck = await this.preCheckAction(action);
      if (!preCheck.passed) {
        return {
          success: false,
          error: preCheck.reason,
        };
      }

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
      this.logger.error(`Action execution failed: ${error.message}`, error.stack);
      return {
        success: false,
        error: error.message || 'Action execution failed',
      };
    }
  }

  private async preCheckAction(
    action: ActionRequest,
  ): Promise<{ passed: boolean; reason?: string }> {
    if (action.type === 'create_purchase_order') {
      if (!action.params.quotationId) {
        return {
          passed: false,
          reason:
            'Không thể tạo đơn mua hàng mà không có báo giá (quotation). Vui lòng tạo quotation trước.',
        };
      }
    }

    if (
      action.type === 'check_inventory' ||
      action.type === 'create_purchase_order' ||
      action.type === 'create_sales_order'
    ) {
      if (action.params.items && Array.isArray(action.params.items)) {
        for (const item of action.params.items) {
          if (action.params.receiveWarehouseId || action.params.warehouseId) {
            const warehouseId =
              action.params.receiveWarehouseId || action.params.warehouseId;
            const inventory = await this.checkInventoryInternal(item.itemId, warehouseId);
            if (inventory) {
              const available =
                (inventory.quantity || 0) - (inventory.onDemandQuantity || 0);
              if (available < (item.quantity || 0)) {
                return {
                  passed: false,
                  reason: `Không đủ tồn kho cho item ${item.itemId || item.itemCode}. Chỉ còn ${available} units.`,
                };
              }
            }
          }
        }
      }
    }

    return { passed: true };
  }

  private async sendRequest(
    client: ClientProxy,
    pattern: string,
    data: any,
    errorMessage: string,
  ): Promise<ActionResult> {
    const result = await RabbitMQUtil.sendRequest(
      client,
      pattern,
      data,
      this.REQUEST_TIMEOUT,
    );

    if (!result) {
      return {
        success: false,
        error: errorMessage,
      };
    }

    return {
      success: true,
      data: result,
      message: 'Success',
    };
  }

  private async checkInventoryInternal(
    itemId: number,
    warehouseId: number,
  ): Promise<any> {
    return RabbitMQUtil.sendRequest(
      this.inventoryClient,
      RABBITMQ_PATTERNS.INVENTORY.INVENTORY.CHECK,
      { itemId, warehouseId },
      this.REQUEST_TIMEOUT,
    );
  }

  // ==================== INVENTORY ACTIONS ====================

  private async checkInventory(params: any): Promise<ActionResult> {
    const result = await this.sendRequest(
      this.inventoryClient,
      RABBITMQ_PATTERNS.INVENTORY.INVENTORY.CHECK,
      params,
      'Không thể kiểm tra tồn kho. Vui lòng thử lại sau.',
    );
    if (result.success) {
      result.message = `Inventory check completed for item ${params.itemId}`;
    }
    return result;
  }

  private async getAllWarehouses(params: any): Promise<ActionResult> {
    const result = await this.sendRequest(
      this.inventoryClient,
      RABBITMQ_PATTERNS.INVENTORY.WAREHOUSE.GET_ALL_IN_COMPANY,
      params,
      'Không thể lấy danh sách kho. Vui lòng thử lại sau.',
    );
    if (result.success && Array.isArray(result.data)) {
      result.message = `Found ${result.data.length} warehouses`;
    }
    return result;
  }

  // ==================== PURCHASE ORDER ACTIONS ====================

  private async getPurchaseOrder(params: any): Promise<ActionResult> {
    const { poId, poCode } = params;
    const pattern = poId
      ? RABBITMQ_PATTERNS.BUSINESS.PO.GET_BY_ID
      : RABBITMQ_PATTERNS.BUSINESS.PO.GET_BY_CODE;
    const payload = poId ? { poId } : { poCode };

    const result = await this.sendRequest(
      this.businessClient,
      pattern,
      payload,
      'Không tìm thấy đơn mua hàng. Vui lòng kiểm tra lại mã đơn hàng.',
    );
    if (result.success) {
      result.message = `Found purchase order ${poId || poCode}`;
    }
    return result;
  }

  private async getAllPurchaseOrders(params: any): Promise<ActionResult> {
    const result = await this.sendRequest(
      this.businessClient,
      RABBITMQ_PATTERNS.BUSINESS.PO.GET_ALL_IN_COMPANY,
      params,
      'Không thể lấy danh sách đơn mua hàng.',
    );
    if (result.success && Array.isArray(result.data)) {
      result.message = `Found ${result.data.length} purchase orders`;
    }
    return result;
  }

  private async createPurchaseOrder(params: any): Promise<ActionResult> {
    return this.sendRequest(
      this.businessClient,
      RABBITMQ_PATTERNS.BUSINESS.PO.CREATE,
      params,
      'Không thể tạo đơn mua hàng. Vui lòng kiểm tra lại thông tin.',
    );
  }

  // ==================== SALES ORDER ACTIONS ====================

  private async getSalesOrder(params: any): Promise<ActionResult> {
    const { soId, soCode } = params;
    const pattern = soId
      ? RABBITMQ_PATTERNS.BUSINESS.SO.GET_BY_ID
      : RABBITMQ_PATTERNS.BUSINESS.SO.GET_BY_CODE;
    const payload = soId ? { soId } : { soCode };

    const result = await this.sendRequest(
      this.businessClient,
      pattern,
      payload,
      'Không tìm thấy đơn bán hàng. Vui lòng kiểm tra lại mã đơn hàng.',
    );
    if (result.success) {
      result.message = `Found sales order ${soId || soCode}`;
    }
    return result;
  }

  private async getAllSalesOrders(params: any): Promise<ActionResult> {
    const result = await this.sendRequest(
      this.businessClient,
      RABBITMQ_PATTERNS.BUSINESS.SO.GET_ALL_IN_COMPANY,
      params,
      'Không thể lấy danh sách đơn bán hàng.',
    );
    if (result.success && Array.isArray(result.data)) {
      result.message = `Found ${result.data.length} sales orders`;
    }
    return result;
  }

  private async createSalesOrder(params: any): Promise<ActionResult> {
    return this.sendRequest(
      this.businessClient,
      RABBITMQ_PATTERNS.BUSINESS.SO.CREATE,
      params,
      'Không thể tạo đơn bán hàng. Vui lòng kiểm tra lại thông tin.',
    );
  }

  // ==================== RFQ ACTIONS ====================

  private async getRFQ(params: any): Promise<ActionResult> {
    const result = await this.sendRequest(
      this.businessClient,
      RABBITMQ_PATTERNS.BUSINESS.RFQ.GET_BY_ID,
      params,
      'Không tìm thấy yêu cầu báo giá.',
    );
    if (result.success) {
      result.message = `Found RFQ ${params.rfqId}`;
    }
    return result;
  }

  private async createRFQ(params: any): Promise<ActionResult> {
    return this.sendRequest(
      this.businessClient,
      RABBITMQ_PATTERNS.BUSINESS.RFQ.CREATE,
      params,
      'Không thể tạo yêu cầu báo giá. Vui lòng kiểm tra lại thông tin.',
    );
  }

  // ==================== QUOTATION ACTIONS ====================

  private async getQuotation(params: any): Promise<ActionResult> {
    const result = await this.sendRequest(
      this.businessClient,
      RABBITMQ_PATTERNS.BUSINESS.QUOTATION.GET_BY_ID,
      params,
      'Không tìm thấy báo giá.',
    );
    if (result.success) {
      result.message = `Found quotation ${params.quotationId}`;
    }
    return result;
  }

  private async createQuotation(params: any): Promise<ActionResult> {
    return this.sendRequest(
      this.businessClient,
      RABBITMQ_PATTERNS.BUSINESS.QUOTATION.CREATE,
      params,
      'Không thể tạo báo giá. Vui lòng kiểm tra lại thông tin.',
    );
  }

  // ==================== ITEM ACTIONS ====================

  private async getItem(params: any): Promise<ActionResult> {
    const { itemId, itemCode } = params;
    if (!itemId && !itemCode) {
      return {
        success: false,
        error: 'Thiếu thông tin itemId hoặc itemCode.',
      };
    }

    const result = await this.sendRequest(
      this.generalClient,
      RABBITMQ_PATTERNS.GENERAL.ITEM.GET_BY_ID,
      itemId ? { itemId } : { itemCode },
      'Không tìm thấy mặt hàng. Vui lòng kiểm tra lại mã hàng.',
    );
    if (result.success) {
      result.message = `Found item ${itemId || itemCode}`;
    }
    return result;
  }

  private async getAllItems(params: any): Promise<ActionResult> {
    const result = await this.sendRequest(
      this.generalClient,
      RABBITMQ_PATTERNS.GENERAL.ITEM.GET_ALL_IN_COMPANY,
      params,
      'Không thể lấy danh sách mặt hàng.',
    );
    if (result.success && Array.isArray(result.data)) {
      result.message = `Found ${result.data.length} items`;
    }
    return result;
  }

  private async getManufactureOrder(params: any): Promise<ActionResult> {
    const { moId, moCode } = params;
    const pattern = moId
      ? RABBITMQ_PATTERNS.OPERATION.MO.GET_BY_ID
      : RABBITMQ_PATTERNS.OPERATION.MO.GET_BY_CODE;
    const payload = moId ? { moId } : { moCode };

    const result = await this.sendRequest(
      this.operationClient,
      pattern,
      payload,
      'Không tìm thấy lệnh sản xuất. Vui lòng kiểm tra lại mã lệnh.',
    );
    if (result.success) {
      result.message = `Found manufacture order ${moId || moCode}`;
    }
    return result;
  }

  private async getAllManufactureOrders(params: any): Promise<ActionResult> {
    const result = await this.sendRequest(
      this.operationClient,
      RABBITMQ_PATTERNS.OPERATION.MO.GET_ALL_IN_COMPANY,
      params,
      'Không thể lấy danh sách lệnh sản xuất.',
    );
    if (result.success && Array.isArray(result.data)) {
      result.message = `Found ${result.data.length} manufacture orders`;
    }
    return result;
  }
}
