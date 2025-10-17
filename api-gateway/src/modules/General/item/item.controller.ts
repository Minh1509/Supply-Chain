import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { RABBITMQ_CONSTANTS } from 'src/common/constants/rabbitmq.constant';
import { SwaggerApiDocument } from 'src/decorators';
import { ItemRequestDto } from './dto/item-request.dto';
// Ensure the DTO file exists and exports these classes, or update the path if needed
import { ItemDto } from './dto/item.dto';
import { ITEM_CONSTANTS } from './item.constant';

@Controller('/item')
@ApiBearerAuth()
@ApiTags('Item')
export class ItemController {
  constructor(
    @Inject(RABBITMQ_CONSTANTS.GENERAL.name) private generalClient: ClientProxy,
  ) {}

  @Post(':companyId')
  async createItem(@Param('companyId') companyId: number, @Body() item: ItemRequestDto) {
    return await firstValueFrom(
      this.generalClient.send(ITEM_CONSTANTS.CREATE_ITEM, { companyId, item }),
    );
  }

  @Get('/all/:companyId')
  async getAll(@Param('companyId') companyId: number) {
    return await firstValueFrom(
      this.generalClient.send(ITEM_CONSTANTS.GET_ALL_ITEMS_IN_COMPANY, { companyId }),
    );
  }

  @Get(':itemId')
  async getById(@Param('itemId') itemId: number) {
    return await firstValueFrom(
      this.generalClient.send(ITEM_CONSTANTS.GET_ITEM_BY_ID, { itemId }),
    );
  }

  @Put(':itemId')
  async update(@Param('itemId') itemId: number, @Body() item: ItemRequestDto) {
    return await firstValueFrom(
      this.generalClient.send(ITEM_CONSTANTS.UPDATE_ITEM, { itemId, item }),
    );
  }

  @Delete(':itemId')
  async delete(@Param('itemId') itemId: string) {
    return await firstValueFrom(
      this.generalClient.send(ITEM_CONSTANTS.DELETE_ITEM, { itemId }),
    );
  }
}
