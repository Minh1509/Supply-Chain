import { Body, Controller, Delete, Get, Inject, Param, Post, Put } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { RABBITMQ_CONSTANTS } from 'src/common/constants/rabbitmq.constant';
import { ManuStageRequestDto } from './dto/manu-stage-request.dto';
import { MANUFACTURE_STAGE_CONSTANTS } from './manufacture-stage.constant';

@Controller('/manufacture-stage')
@ApiBearerAuth()
@ApiTags('Manufacture Stage')
export class ManufactureStageController {
  constructor(
    @Inject(RABBITMQ_CONSTANTS.OPERATION.name) private operationClient: ClientProxy,
  ) {}

  @Post('/user/create-stage')
  async createStage(@Body() request: ManuStageRequestDto) {
    return await firstValueFrom(
      this.operationClient.send(MANUFACTURE_STAGE_CONSTANTS.CREATE_STAGE, { stage: request }),
    );
  }

  @Get('/user/get-stage-by-item/:itemId')
  async getStagesByItemId(@Param('itemId') itemId: number) {
    return await firstValueFrom(
      this.operationClient.send(MANUFACTURE_STAGE_CONSTANTS.GET_STAGE_BY_ITEM, { itemId }),
    );
  }

  @Get('/user/get-stage-by-id/:stageId')
  async getStage(@Param('stageId') stageId: number) {
    return await firstValueFrom(
      this.operationClient.send(MANUFACTURE_STAGE_CONSTANTS.GET_STAGE_BY_ID, { stageId }),
    );
  }

  @Get('/user/get-all-stage-in-com/:companyId')
  async getAllStageInCompany(@Param('companyId') companyId: number) {
    return await firstValueFrom(
      this.operationClient.send(MANUFACTURE_STAGE_CONSTANTS.GET_ALL_STAGES_IN_COMPANY, { companyId }),
    );
  }

  @Put('/user/update-stage/:stageId')
  async updateStage(@Param('stageId') stageId: number, @Body() stage: ManuStageRequestDto) {
    return await firstValueFrom(
      this.operationClient.send(MANUFACTURE_STAGE_CONSTANTS.UPDATE_STAGE, { stageId, stage }),
    );
  }

  @Delete('/user/delete-stage/:stageId')
  async deleteStage(@Param('stageId') stageId: number) {
    return await firstValueFrom(
      this.operationClient.send(MANUFACTURE_STAGE_CONSTANTS.DELETE_STAGE, { stageId }),
    );
  }
}