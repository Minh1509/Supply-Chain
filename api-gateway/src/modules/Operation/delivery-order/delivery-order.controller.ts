import { Body, Controller, Get, Inject, Param, Post, Put } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { RABBITMQ_CONSTANTS } from 'src/common/constants/rabbitmq.constant';
import { DeliveryOrderRequestDto } from './dto/delivery-order-request.dto';
import { DELIVERY_ORDER_CONSTANTS } from './delivery-order.constant';

@Controller('/delivery-order')
@ApiBearerAuth()
@ApiTags('Delivery Order')
export class DeliveryOrderController {
  constructor(
    @Inject(RABBITMQ_CONSTANTS.OPERATION.name) private operationClient: ClientProxy,
  ) {}

  @Post()
  async createDeliveryOrder(@Body() deliveryOrderData: DeliveryOrderRequestDto) {
    return await firstValueFrom(
      this.operationClient.send(DELIVERY_ORDER_CONSTANTS.CREATE_DO, { deliveryOrderData }),
    );
  }

  @Get(':doId')
  async getDeliveryOrderById(@Param('doId') doId: number) {
    return await firstValueFrom(
      this.operationClient.send(DELIVERY_ORDER_CONSTANTS.GET_DO_BY_ID, { doId }),
    );
  }

  @Get('/so/:soId')
  async getDoBySoId(@Param('soId') soId: number) {
    return await firstValueFrom(
      this.operationClient.send(DELIVERY_ORDER_CONSTANTS.GET_DO_BY_SO_ID, { soId }),
    );
  }

  @Get('all/:companyId')
  async getAllDeliveryOrdersInCompany(@Param('companyId') companyId: number) {
    return await firstValueFrom(
      this.operationClient.send(DELIVERY_ORDER_CONSTANTS.GET_ALL_DO_IN_COMPANY, { companyId }),
    );
  }

  @Put(':doId')
  async updateDeliveryOrder(@Param('doId') doId: number, @Body() deliveryOrderData: DeliveryOrderRequestDto) {
    return await firstValueFrom(
      this.operationClient.send(DELIVERY_ORDER_CONSTANTS.UPDATE_DO, { doId, deliveryOrderData }),
    );
  }
}