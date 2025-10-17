import { Body, Controller, Delete, Get, Inject, Param, Post, Put } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { RABBITMQ_CONSTANTS } from 'src/common/constants/rabbitmq.constant';
import { WarehouseRequestDto } from './dto/warehouse-request.dto';
import { WAREHOUSE_CONSTANTS } from './warehouse.constant';

@Controller('/warehouse')
@ApiBearerAuth()
@ApiTags('Warehouse')
export class WarehouseController {
  constructor(
    @Inject(RABBITMQ_CONSTANTS.INVENTORY.name) private inventoryClient: ClientProxy,
  ) {}

  @Post(':companyId')
  async createWarehouse(
    @Param('companyId') companyId: number,
    @Body() warehouse: WarehouseRequestDto,
  ) {
    return await firstValueFrom(
      this.inventoryClient.send(WAREHOUSE_CONSTANTS.CREATE_WAREHOUSE, { companyId, warehouse }),
    );
  }

  @Get('/all/:companyId')
  async getAllWarehousesInCompany(@Param('companyId') companyId: number) {
    return await firstValueFrom(
      this.inventoryClient.send(WAREHOUSE_CONSTANTS.GET_ALL_WAREHOUSES_IN_COMPANY, { companyId }),
    );
  }

  @Get(':warehouseId')
  async getWarehouseById(@Param('warehouseId') warehouseId: number) {
    return await firstValueFrom(
      this.inventoryClient.send(WAREHOUSE_CONSTANTS.GET_WAREHOUSE_BY_ID, { warehouseId }),
    );
  }

  @Put(':warehouseId')
  async updateWarehouse(
    @Param('warehouseId') warehouseId: number,
    @Body() warehouse: WarehouseRequestDto,
  ) {
    return await firstValueFrom(
      this.inventoryClient.send(WAREHOUSE_CONSTANTS.UPDATE_WAREHOUSE, { warehouseId, warehouse }),
    );
  }

  @Delete(':warehouseId')
  async deleteWarehouse(@Param('warehouseId') warehouseId: number) {
    return await firstValueFrom(
      this.inventoryClient.send(WAREHOUSE_CONSTANTS.DELETE_WAREHOUSE, { warehouseId }),
    );
  }
}
