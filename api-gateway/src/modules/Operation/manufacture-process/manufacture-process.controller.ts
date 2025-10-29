import { Body, Controller, Get, Inject, Param, Post, Put } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { RABBITMQ_CONSTANTS } from 'src/common/constants/rabbitmq.constant';
import { MANUFACTURE_PROCESS_CONSTANTS } from './manufacture-process.constant';
import { ManuProcessRequestDto } from './dto/manu-process-request.dto';

@Controller('/manufacture-process')
@ApiBearerAuth()
@ApiTags('ManufactureProcess')
export class ManufactureProcessController {
  constructor(@Inject(RABBITMQ_CONSTANTS.OPERATION.name) private operationClient: ClientProxy) {}

  @Post('/user/create-process')
  async createProcess(@Body() process: ManuProcessRequestDto) {
    return await firstValueFrom(
      this.operationClient.send(MANUFACTURE_PROCESS_CONSTANTS.CREATE_PROCESS, { process }),
    );
  }

  @Get('/user/get-all-process-in-mo/:moId')
  async getAllProcesses(@Param('moId') moId: number) {
    return await firstValueFrom(
      this.operationClient.send(MANUFACTURE_PROCESS_CONSTANTS.GET_ALL_PROCESS_IN_MO, { moId }),
    );
  }

  @Get('/user/get-process/:processId')
  async getProcess(@Param('processId') processId: number) {
    return await firstValueFrom(
      this.operationClient.send(MANUFACTURE_PROCESS_CONSTANTS.GET_PROCESS_BY_ID, { processId }),
    );
  }

  @Put('/user/update-process/:processId')
  async updateProcess(
    @Param('processId') processId: number,
    @Body() process: ManuProcessRequestDto,
  ) {
    return await firstValueFrom(
      this.operationClient.send(MANUFACTURE_PROCESS_CONSTANTS.UPDATE_PROCESS, { processId, process }),
    );
  }
}
