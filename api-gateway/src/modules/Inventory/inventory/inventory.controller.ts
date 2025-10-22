import { Body, Controller, Get, Inject, Param, Post, Put, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { RABBITMQ_CONSTANTS } from 'src/common/constants/rabbitmq.constant';
import { InventoryRequestDto } from './dto/inventory-request.dto';
import { INVENTORY_CONSTANTS } from './inventory.constant';

@Controller('/inventory')
@ApiBearerAuth()
@ApiTags('Inventory')
export class InventoryController {
  constructor(
    @Inject(RABBITMQ_CONSTANTS.INVENTORY.name) private inventoryClient: ClientProxy,
  ) {}

  @Post()
  async createInventory(@Body() inventory: InventoryRequestDto) {
    return await firstValueFrom(
      this.inventoryClient.send(INVENTORY_CONSTANTS.CREATE_INVENTORY, { inventory }),
    );
  }

  @Get('check/:itemId/:warehouseId')
  async checkInventory(
    @Param('itemId') itemId: number,
    @Param('warehouseId') warehouseId: number,
    @Query('amount') amount: number,
  ) {
    return await firstValueFrom(
      this.inventoryClient.send(INVENTORY_CONSTANTS.CHECK_INVENTORY, {
        itemId,
        warehouseId,
        amount,
      }),
    );
  }

  @Get(':inventoryId')
  async getInventoryById(@Param('inventoryId') inventoryId: number) {
    return await firstValueFrom(
      this.inventoryClient.send(INVENTORY_CONSTANTS.GET_INVENTORY_BY_ID, { inventoryId }),
    );
  }

  @Put(':inventoryId')
  async updateInventory(
    @Param('inventoryId') inventoryId: number,
    @Body() inventory: InventoryRequestDto,
  ) {
    return await firstValueFrom(
      this.inventoryClient.send(INVENTORY_CONSTANTS.UPDATE_INVENTORY, {
        inventoryId,
        inventory,
      }),
    );
  }

  @Post('increase-quantity')
  async increaseQuantity(@Body() inventory: InventoryRequestDto) {
    return await firstValueFrom(
      this.inventoryClient.send(INVENTORY_CONSTANTS.INCREASE_QUANTITY, { inventory }),
    );
  }

  @Post('decrease-quantity')
  async decreaseQuantity(@Body() inventory: InventoryRequestDto) {
    return await firstValueFrom(
      this.inventoryClient.send(INVENTORY_CONSTANTS.DECREASE_QUANTITY, { inventory }),
    );
  }

  @Post('increase-ondemand')
  async increaseOnDemand(@Body() inventory: InventoryRequestDto) {
    return await firstValueFrom(
      this.inventoryClient.send(INVENTORY_CONSTANTS.INCREASE_ON_DEMAND, { inventory }),
    );
  }

  @Post('decrease-ondemand')
  async decreaseOnDemand(@Body() inventory: InventoryRequestDto) {
    return await firstValueFrom(
      this.inventoryClient.send(INVENTORY_CONSTANTS.DECREASE_ON_DEMAND, { inventory }),
    );
  }

  @Get('all/:companyId/:itemId/:warehouseId')
  async getAllByItemAndWarehouse(
    @Param('companyId') companyId: number,
    @Param('itemId') itemId: number,
    @Param('warehouseId') warehouseId: number,
  ) {
    return await firstValueFrom(
      this.inventoryClient.send(INVENTORY_CONSTANTS.GET_ALL_BY_ITEM_AND_WAREHOUSE, {
        companyId,
        itemId,
        warehouseId,
      }),
    );
  }
}
