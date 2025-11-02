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

  @Get(':moId')
  async getOrder(@Param('moId') moId: number) {
    return await firstValueFrom(
      this.operationClient.send(MANUFACTURE_ORDER_CONSTANTS.GET_MO_BY_ID, {  moId }),
    );
  }

  @Get('/code/:moCode')
  async getOrderByCode(@Param('moCode') moCode: string) {
    return await firstValueFrom(
      this.operationClient.send(MANUFACTURE_ORDER_CONSTANTS.GET_MO_BY_CODE, { moCode }),
    );
  }

  @Put(':moId')
  async updateOrder(@Param('moId') moId: number, @Body() manuOrderData: ManuOrderRequestDto) {
    return await firstValueFrom(
      this.operationClient.send(MANUFACTURE_ORDER_CONSTANTS.UPDATE_MO, { moId,  manuOrderData }),
    );
  }

  @Post('/report/:companyId')
  async getReceiveReport(@Body() manuReportRequest: ManuReportRequestDto, @Param('companyId') companyId: number) {
    return await firstValueFrom(
      this.operationClient.send(MANUFACTURE_ORDER_CONSTANTS.MANUFACTURE_REPORT, { manuReportRequest, companyId }),
    );
  }

  @Get('/monthly-report/:companyId')
  async getMonthlyManuReport(@Param('companyId') companyId: number, @Query('type') type?: string) {
    return await firstValueFrom(
      this.operationClient.send(MANUFACTURE_ORDER_CONSTANTS.MONTHLY_MANU_REPORT, { companyId, type }),
    );
  }
}
