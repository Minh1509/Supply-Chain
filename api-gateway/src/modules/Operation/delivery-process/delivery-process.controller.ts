import { Body, Controller, Get, Inject, Param, Post, Put } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { RABBITMQ_CONSTANTS } from 'src/common/constants/rabbitmq.constant';
import { DeliveryProcessRequestDto } from './dto/delivery-process-request.dto';
import { DELIVERY_PROCESS_CONSTANTS } from './delivery-process.constant';

@Controller('/delivery-process')
@ApiBearerAuth()
@ApiTags('Delivery Process')
export class DeliveryProcessController {
  constructor(
    @Inject(RABBITMQ_CONSTANTS.OPERATION.name) private operationClient: ClientProxy,
  ) {}

  @Post()
  async createDeliveryProcess(@Body() deliveryProcessData: DeliveryProcessRequestDto) {
    return await firstValueFrom(
      this.operationClient.send(DELIVERY_PROCESS_CONSTANTS.CREATE_DELIVERY_PROCESS, { deliveryProcessData }),
    );
  }

  @Get(':doId')
  async getAllDeliveryProcesses(@Param('doId') doId: number) {
    return await firstValueFrom(
      this.operationClient.send(DELIVERY_PROCESS_CONSTANTS.GET_ALL_DELIVERY_PROCESS, { doId }),
    );
  }

  @Put(':processId')
  async updateDeliveryProcess(@Param('processId') processId: number, @Body() deliveryProcessData: DeliveryProcessRequestDto) {
    return await firstValueFrom(
      this.operationClient.send(DELIVERY_PROCESS_CONSTANTS.UPDATE_DELIVERY_PROCESS, { processId, deliveryProcessData }),
    );
  }
}