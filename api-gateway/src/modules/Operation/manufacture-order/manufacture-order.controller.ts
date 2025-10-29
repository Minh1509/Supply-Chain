import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { RABBITMQ_CONSTANTS } from 'src/common/constants/rabbitmq.constant';
import { ManuOrderRequestDto, ManuReportRequestDto } from './dto/manu-order-request.dto';
import { MANUFACTURE_ORDER_CONSTANTS } from './manufacture-order.constant';

@Controller('/manufacture-order')
@ApiBearerAuth()
@ApiTags('ManufactureOrder')
export class ManufactureOrderController {
  constructor(
    @Inject(RABBITMQ_CONSTANTS.OPERATION.name) private operationClient: ClientProxy,
  ) {}

  @Post()
  async createOrder(@Body() manuOrderData: ManuOrderRequestDto) {
    return await firstValueFrom(
      this.operationClient.send(MANUFACTURE_ORDER_CONSTANTS.CREATE_MO, { manuOrderData }),
    );
  }

  @Get('/all-by-item/:itemId')
  async getAllOrders(@Param('itemId') itemId: number) {
    return await firstValueFrom(
      this.operationClient.send(MANUFACTURE_ORDER_CONSTANTS.GET_ALL_MO_BY_ITEM, { itemId }),
    );
  }

  @Get('/all-in-com/:companyId')
  async getAllOrdersByCompany(@Param('companyId') companyId: number) {
    return await firstValueFrom(
      this.operationClient.send(MANUFACTURE_ORDER_CONSTANTS.GET_ALL_MO_IN_COMPANY, { companyId }),
    );
  }

  @Get(':moid')
  async getOrder(@Param('moid') moid: number) {
    return await firstValueFrom(
      this.operationClient.send(MANUFACTURE_ORDER_CONSTANTS.GET_MO_BY_ID, {  moid }),
    );
  }

  @Put(':moid')
  async updateOrder(@Param('moid') moid: number, @Body() order: ManuOrderRequestDto) {
    return await firstValueFrom(
      this.operationClient.send(MANUFACTURE_ORDER_CONSTANTS.UPDATE_MO, { moid,  order }),
    );
  }

  @Post('/report/:companyId')
  async getReceiveReport(@Body() request: ManuReportRequestDto, @Param('companyId') companyId: number) {
    return await firstValueFrom(
      this.operationClient.send(MANUFACTURE_ORDER_CONSTANTS.MANUFACTURE_REPORT, { request, companyId }),
    );
  }

  @Get('/monthly-report/:companyId')
  async getMonthlyManuReport(@Param('companyId') companyId: number, @Query('type') type?: string) {
    return await firstValueFrom(
      this.operationClient.send(MANUFACTURE_ORDER_CONSTANTS.MONTHLY_MANU_REPORT, { companyId, type }),
    );
  }
}
