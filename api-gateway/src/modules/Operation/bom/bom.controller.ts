import { Body, Controller, Delete, Get, Inject, Param, Post, Put } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { RABBITMQ_CONSTANTS } from 'src/common/constants/rabbitmq.constant';
import { BOMRequestDto } from './dto/bom-request.dto';
import { BOM_CONSTANTS } from './bom.constant';

@Controller('/bom')
@ApiBearerAuth()
@ApiTags('BOM')
export class BOMController {
  constructor(
    @Inject(RABBITMQ_CONSTANTS.OPERATION.name) private operationClient: ClientProxy,
  ) {}

  @Post()
  async createBOM(@Body() request: BOMRequestDto) {
    return await firstValueFrom(
      this.operationClient.send(BOM_CONSTANTS.CREATE_BOM, { bom: request }),
    );
  }

  @Get('all/:companyId')
  async getAllBOMsByCompany(@Param('companyId') companyId: number) {
    return await firstValueFrom(
      this.operationClient.send(BOM_CONSTANTS.GET_ALL_BOMS_IN_COMPANY, { companyId }),
    );
  }

  @Get(':itemId')
  async getBOMById(@Param('itemId') itemId: number) {
    return await firstValueFrom(
      this.operationClient.send(BOM_CONSTANTS.GET_BOM_BY_ITEM, { itemId }),
    );
  }

  @Put(':bomId')
  async updateBOM(@Param('bomId') bomId: number, @Body() bom: BOMRequestDto) {
    return await firstValueFrom(
      this.operationClient.send(BOM_CONSTANTS.UPDATE_BOM, { bomId, bom }),
    );
  }

  @Delete(':bomId')
  async deleteBOM(@Param('bomId') bomId: number) {
    return await firstValueFrom(
      this.operationClient.send(BOM_CONSTANTS.DELETE_BOM, { bomId }),
    );
  }
}
