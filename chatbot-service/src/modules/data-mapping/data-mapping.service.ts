import { Injectable } from '@nestjs/common';

@Injectable()
export class DataMappingService {
  mapPurchaseOrderToReadable(po: any): string {
    if (!po) {
      return 'Không tìm thấy đơn mua hàng';
    }

    const details = po.purchaseOrderDetails || [];
    const totalAmount = details.reduce(
      (sum: number, d: any) =>
        sum + d.quantity * d.itemPrice * (1 - (d.discount || 0) / 100),
      0,
    );

    return `Đơn mua hàng: ${po.poCode}
Nhà cung cấp: ${po.supplierCompanyId || 'N/A'}
Kho nhận hàng: ${po.receiveWarehouseId || 'N/A'}
Trạng thái: ${this.formatStatus(po.status)}
Phương thức thanh toán: ${po.paymentMethod || 'N/A'}
Địa chỉ giao hàng: ${po.deliveryToAddress || 'N/A'}
Ngày tạo: ${this.formatDate(po.createdOn)}
Người tạo: ${po.createdBy || 'N/A'}

Chi tiết đơn hàng:
${details
  .map(
    (d: any, idx: number) =>
      `${idx + 1}. Item ${d.itemId || d.itemCode || 'N/A'} - Số lượng: ${this.formatNumber(d.quantity)} ${d.uom || ''} - Đơn giá: ${this.formatCurrency(d.itemPrice)} - Giảm giá: ${d.discount || 0}% - Thành tiền: ${this.formatCurrency(d.quantity * d.itemPrice * (1 - (d.discount || 0) / 100))}`,
  )
  .join('\n')}

Tổng tiền: ${this.formatCurrency(totalAmount)}`;
  }

  mapSalesOrderToReadable(so: any): string {
    if (!so) {
      return 'Không tìm thấy đơn bán hàng';
    }

    const details = so.salesOrderDetails || [];
    const totalAmount = details.reduce(
      (sum: number, d: any) =>
        sum + d.quantity * d.itemPrice * (1 - (d.discount || 0) / 100),
      0,
    );

    return `Đơn bán hàng: ${so.soCode}
Khách hàng: ${so.customerCompanyId || 'N/A'}
Trạng thái: ${this.formatStatus(so.status)}
Phương thức thanh toán: ${so.paymentMethod || 'N/A'}
Địa chỉ giao từ: ${so.deliveryFromAddress || 'N/A'}
Địa chỉ giao đến: ${so.deliveryToAddress || 'N/A'}
Ngày tạo: ${this.formatDate(so.createdOn)}
Người tạo: ${so.createdBy || 'N/A'}

Chi tiết đơn hàng:
${details
  .map(
    (d: any, idx: number) =>
      `${idx + 1}. Item ${d.itemId || d.itemCode || 'N/A'} - Số lượng: ${this.formatNumber(d.quantity)} ${d.uom || ''} - Đơn giá: ${this.formatCurrency(d.itemPrice)} - Thành tiền: ${this.formatCurrency(d.quantity * d.itemPrice * (1 - (d.discount || 0) / 100))}`,
  )
  .join('\n')}

Tổng tiền: ${this.formatCurrency(totalAmount)}`;
  }

  mapInventoryToReadable(inventory: any | any[]): string {
    if (Array.isArray(inventory)) {
      if (inventory.length === 0) {
        return 'Không tìm thấy tồn kho';
      }

      return inventory
        .map((inv, idx) => {
          const available = (inv.quantity || 0) - (inv.onDemandQuantity || 0);
          return `${idx + 1}. Kho: ${inv.warehouseName || inv.warehouseCode || 'N/A'} - Item: ${inv.itemName || inv.itemCode || inv.itemId || 'N/A'} - Tồn kho: ${this.formatNumber(inv.quantity || 0)} ${inv.uom || ''} - Đã đặt: ${this.formatNumber(inv.onDemandQuantity || 0)} ${inv.uom || ''} - Còn lại: ${this.formatNumber(available)} ${inv.uom || ''}`;
        })
        .join('\n');
    }

    const available = (inventory.quantity || 0) - (inventory.onDemandQuantity || 0);
    return `Kho: ${inventory.warehouseName || inventory.warehouseCode || 'N/A'} - Item: ${inventory.itemName || inventory.itemCode || inventory.itemId || 'N/A'} - Tồn kho: ${this.formatNumber(inventory.quantity || 0)} ${inventory.uom || ''} - Đã đặt: ${this.formatNumber(inventory.onDemandQuantity || 0)} ${inventory.uom || ''} - Còn lại: ${this.formatNumber(available)} ${inventory.uom || ''}`;
  }

  mapItemToReadable(item: any): string {
    if (!item) {
      return 'Không tìm thấy mặt hàng';
    }

    return `Mặt hàng: ${item.itemName || item.itemCode}
Mã hàng: ${item.itemCode}
Loại: ${item.itemType || 'N/A'}
Đơn vị: ${item.uom || 'N/A'}
Có thể bán: ${item.isSellable ? 'Có' : 'Không'}
Giá nhập: ${this.formatCurrency(item.importPrice)}
Giá bán: ${this.formatCurrency(item.exportPrice)}
Mô tả: ${item.description || 'N/A'}
Thông số kỹ thuật: ${item.technicalSpecifications || 'N/A'}`;
  }

  mapWarehouseToReadable(warehouse: any | any[]): string {
    if (Array.isArray(warehouse)) {
      if (warehouse.length === 0) {
        return 'Không tìm thấy kho nào';
      }

      return warehouse
        .map(
          (wh, idx) =>
            `${idx + 1}. ${wh.warehouseName || wh.warehouseCode} - Mã: ${wh.warehouseCode} - Loại: ${wh.warehouseType || 'N/A'} - Sức chứa: ${this.formatNumber(wh.maxCapacity || 0)} - Trạng thái: ${this.formatStatus(wh.status)} - Mô tả: ${wh.description || 'N/A'}`,
        )
        .join('\n');
    }

    return `Kho: ${warehouse.warehouseName || warehouse.warehouseCode}
Mã kho: ${warehouse.warehouseCode}
Loại: ${warehouse.warehouseType || 'N/A'}
Sức chứa: ${this.formatNumber(warehouse.maxCapacity || 0)}
Trạng thái: ${this.formatStatus(warehouse.status)}
Mô tả: ${warehouse.description || 'N/A'}`;
  }

  mapItemListToReadable(items: any[]): string {
    if (items.length === 0) {
      return 'Không tìm thấy mặt hàng nào';
    }

    const displayItems = items.slice(0, 10); // Show max 10 items
    const moreCount = items.length - displayItems.length;

    return (
      displayItems
        .map(
          (item, idx) =>
            `${idx + 1}. ${item.itemName || item.itemCode} - Mã: ${item.itemCode} - Loại: ${item.itemType || 'N/A'} - Đơn vị: ${item.uom || 'N/A'} - Giá bán: ${this.formatCurrency(item.exportPrice)}`,
        )
        .join('\n') + (moreCount > 0 ? `\n... và ${moreCount} mặt hàng khác` : '')
    );
  }

  private formatCurrency(amount: number | null | undefined): string {
    if (amount === null || amount === undefined) {
      return 'N/A';
    }
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  }

  private formatNumber(num: number | null | undefined): string {
    if (num === null || num === undefined) {
      return '0';
    }
    return new Intl.NumberFormat('vi-VN').format(num);
  }

  private formatDate(date: string | Date | null | undefined): string {
    if (!date) {
      return 'N/A';
    }
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  }

  private formatStatus(status: string | null | undefined): string {
    if (!status) {
      return 'N/A';
    }

    const statusMap: Record<string, string> = {
      DRAFT: 'Nháp',
      PENDING: 'Đang chờ',
      APPROVED: 'Đã duyệt',
      COMPLETED: 'Hoàn thành',
      CANCELLED: 'Đã hủy',
      CONFIRMED: 'Đã xác nhận',
      SHIPPED: 'Đang vận chuyển',
      DELIVERED: 'Đã giao hàng',
      SENT: 'Đã gửi',
      RECEIVED: 'Đã nhận',
      ACCEPTED: 'Đã chấp nhận',
      REJECTED: 'Đã từ chối',
      EXPIRED: 'Hết hạn',
      IN_PROGRESS: 'Đang thực hiện',
      PLANNED: 'Đã lên kế hoạch',
    };

    return statusMap[status.toUpperCase()] || status;
  }

  mapDataByIntent(data: any, intent?: string): string | null {
    if (!data) return null;

    switch (intent) {
      case 'check_inventory':
        return this.mapInventoryToReadable(data);
      case 'get_order_status':
        if (data.poCode || data.poId) {
          return this.mapPurchaseOrderToReadable(data);
        }
        if (data.soCode || data.soId) {
          return this.mapSalesOrderToReadable(data);
        }
        return null;
      case 'find_item':
      case 'get_item':
        return Array.isArray(data)
          ? this.mapItemListToReadable(data)
          : this.mapItemToReadable(data);
      case 'check_warehouse':
      case 'get_all_warehouses':
        return Array.isArray(data)
          ? this.mapWarehouseToReadable(data)
          : this.mapWarehouseToReadable(data);
      default:
        return null;
    }
  }

  mapActionResult(data: any, actionType: string): string {
    if (!data) {
      return 'Đã thực hiện thành công';
    }

    switch (actionType) {
      case 'create_purchase_order':
        return `Đơn mua hàng đã được tạo thành công.\n${this.mapPurchaseOrderToReadable(data)}`;
      case 'create_sales_order':
        return `Đơn bán hàng đã được tạo thành công.\n${this.mapSalesOrderToReadable(data)}`;
      default:
        return 'Đã thực hiện thành công';
    }
  }
}
