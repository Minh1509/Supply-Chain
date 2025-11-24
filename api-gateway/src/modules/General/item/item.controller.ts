import { Body, Controller, Delete, Get, HttpStatus, Inject, Param, ParseIntPipe, Post, Put, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { RABBITMQ_CONSTANTS } from 'src/common/constants/rabbitmq.constant';
import { UploadResponseDto } from 'src/common/dto/upload-response.dto';
import { S3Service } from 'src/common/services/s3.service';
import { SwaggerApiDocument } from 'src/decorators';
import { ADMIN_COMPANY_CONSTANTS } from 'src/modules/admin/admin-company/admin-company.constant';
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
    private s3Service: S3Service,
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

  @Post(':itemId/image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({
    summary: `Update Image Item`,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: UploadResponseDto,
  })
  async uploadLogo(
    @Param('itemId', ParseIntPipe) itemId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const imageUrl = await this.s3Service.uploadFile(file, 'items/');
    
     await firstValueFrom(
      this.generalClient.send(ITEM_CONSTANTS.UPDATE_IMAGE_ITEM, { itemId, imageUrl }),
    );
    return {url: imageUrl}
  }
}
