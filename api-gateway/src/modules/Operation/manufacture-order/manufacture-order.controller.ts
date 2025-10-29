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

  @Post('/user/create-mo')
  async createOrder(@Body() request: ManuOrderRequestDto) {
    return await firstValueFrom(
      this.operationClient.send(MANUFACTURE_ORDER_CONSTANTS.CREATE_MO, { mo: request }),
    );
  }

  @Get('/user/get-all-mo-in-item/:itemId')
  async getAllOrders(@Param('itemId') itemId: number) {
    return await firstValueFrom(
      this.operationClient.send(MANUFACTURE_ORDER_CONSTANTS.GET_ALL_MO_BY_ITEM, { itemId }),
    );
  }

  @Get('/user/get-all-mo-in-com/:companyId')
  async getAllOrdersByCompany(@Param('companyId') companyId: number) {
    return await firstValueFrom(
      this.operationClient.send(MANUFACTURE_ORDER_CONSTANTS.GET_ALL_MO_IN_COMPANY, { companyId }),
    );
  }

  @Get('/user/get-mo/:moid')
  async getOrder(@Param('moid') moid: number) {
    return await firstValueFrom(
      this.operationClient.send(MANUFACTURE_ORDER_CONSTANTS.GET_MO_BY_ID, { moId: moid }),
    );
  }

  @Put('/user/update-mo/:moid')
  async updateOrder(@Param('moid') moid: number, @Body() order: ManuOrderRequestDto) {
    return await firstValueFrom(
      this.operationClient.send(MANUFACTURE_ORDER_CONSTANTS.UPDATE_MO, { moId: moid, mo: order }),
    );
  }

  @Post('/user/manufacture-report/:companyId')
  async getReceiveReport(@Body() request: ManuReportRequestDto, @Param('companyId') companyId: number) {
    return await firstValueFrom(
      this.operationClient.send(MANUFACTURE_ORDER_CONSTANTS.MANUFACTURE_REPORT, { request, companyId }),
    );
  }

  @Get('/user/monthly-manufacture-report/:companyId')
  async getMonthlyManuReport(@Param('companyId') companyId: number, @Query('type') type?: string) {
    return await firstValueFrom(
      this.operationClient.send(MANUFACTURE_ORDER_CONSTANTS.MONTHLY_MANU_REPORT, { companyId, type }),
    );
  }
}
