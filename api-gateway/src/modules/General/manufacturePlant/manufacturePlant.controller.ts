import { Body, Controller, Get, Inject, Param, Post, Put } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { RABBITMQ_CONSTANTS } from 'src/common/constants/rabbitmq.constant';
import { ManuPlantRequestDto } from './dto/manufacturePlant-request.dto';
import { MANUFACTURE_PLANT_CONSTANTS } from './manufacturePlant.constant';

@Controller('/manufacture-plant')
@ApiBearerAuth()
@ApiTags('ManufacturePlant')
export class ManufacturePlantController {
  constructor(
    @Inject(RABBITMQ_CONSTANTS.GENERAL.name) private generalClient: ClientProxy,
  ) {}

  @Post(':companyId')
  async createPlant(
    @Param('companyId') companyId: number,
    @Body() plant: ManuPlantRequestDto,
  ) {
    const payload = { companyId, plant };
    return await firstValueFrom(
      this.generalClient.send(MANUFACTURE_PLANT_CONSTANTS.CREATE_PLANT, payload),
    );
  }

  @Get('/all/:companyId')
  async getAllPlants(@Param('companyId') companyId: number) {
    return await firstValueFrom(
      this.generalClient.send(MANUFACTURE_PLANT_CONSTANTS.GET_ALL_PLANTS_IN_COMPANY, {
        companyId: Number(companyId),
      }),
    );
  }

  @Get(':plantId')
  async getPlantById(@Param('plantId') plantId: number) {
    return await firstValueFrom(
      this.generalClient.send(MANUFACTURE_PLANT_CONSTANTS.GET_PLANT_BY_ID, {
        plantId: Number(plantId),
      }),
    );
  }

  @Put(':plantId')
  async updatePlant(
    @Param('plantId') plantId: number,
    @Body() plant: ManuPlantRequestDto,
  ) {
    const payload = { plantId,plant };
    return await firstValueFrom(
      this.generalClient.send(MANUFACTURE_PLANT_CONSTANTS.UPDATE_PLANT, payload),
    );
  }
}
