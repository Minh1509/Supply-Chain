import { Body, Controller, Get, HttpStatus, Param, Post, Put } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RABBITMQ_CONSTANTS } from 'src/common/constants/rabbitmq.constant';
import { SwaggerApiDocument } from 'src/decorators/api-document.decorator';
import { ManufactureLineRequestDto } from './dto/manufactureLine-request.dto';
import { ManufactureLineDto } from './dto/manufactureLine.dto';
import { MANUFACTURE_LINE_CONSTANTS } from './manufactureLine.constant';

@Controller('/manufacture-line')
@ApiBearerAuth()
@ApiTags('ManufactureLine')
export class ManufactureLineController {
  constructor(
    @Inject(RABBITMQ_CONSTANTS.GENERAL.name) private generalClient: ClientProxy,
  ) {}

  @Post(':plantId')
  async createLine(
    @Param('plantId') plantId: number,
    @Body() line: ManufactureLineRequestDto,
  ) {
    return this.generalClient.send(MANUFACTURE_LINE_CONSTANTS.CREATE_LINE, {
      plantId: Number(plantId),
      ...line,
    });
  }

  @Get(':companyId')
  async getAllLinesInCompany(@Param('companyId') companyId: number) {
    return this.generalClient.send(MANUFACTURE_LINE_CONSTANTS.GET_ALL_LINES_IN_COMPANY, {
      companyId: Number(companyId),
    });
  }

  @Get(':lineId')
  async getLineById(@Param('lineId') lineId: number) {
    return this.generalClient.send(MANUFACTURE_LINE_CONSTANTS.GET_LINE_BY_ID, {
      lineId: Number(lineId),
    });
  }

  @Put(':lineId')
  async updateLine(
    @Param('lineId') lineId: number,
    @Body() line: ManufactureLineRequestDto,
  ) {
    return this.generalClient.send(MANUFACTURE_LINE_CONSTANTS.UPDATE_LINE, {
      lineId: Number(lineId),
      ...line,
    });
  }
}
