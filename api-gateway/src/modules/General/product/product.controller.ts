import { Body, Controller, Delete, Get, Inject, Param, Post, Put } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { RABBITMQ_CONSTANTS } from 'src/common/constants/rabbitmq.constant';
import { SwaggerApiDocument } from 'src/decorators/api-document.decorator';
import { ProductRequestDto } from './dto/product-request.dto';
import { ProductDto } from './dto/product.dto';
import { PRODUCT_CONSTANTS } from './product.constant';

@Controller('/product')
@ApiBearerAuth()
@ApiTags('Product')
export class ProductController {
  constructor(
    @Inject(RABBITMQ_CONSTANTS.GENERAL.name) private generalClient: ClientProxy,
  ) { }

  @Post('/batch')
  async batchCreateProducts(@Body() body: {
    itemId: number;
    quantity: number;
    batchNo: string;
    moId: number;
  }) {
    return await firstValueFrom(
      this.generalClient.send(PRODUCT_CONSTANTS.BATCH_CREATE, body),
    );
  }

  @Get('/scan/:qrCode')
  async scanQRCode(@Param('qrCode') qrCode: string) {
    return await firstValueFrom(
      this.generalClient.send(PRODUCT_CONSTANTS.SCAN_DETAIL, { qrCode }),
    );
  }

  @Get('/batch/:batchNo')
  async getProductsByBatch(@Param('batchNo') batchNo: string) {
    return await firstValueFrom(
      this.generalClient.send(PRODUCT_CONSTANTS.GET_PRODUCTS_BY_BATCH, { batchNo }),
    );
  }

  @Get('/batch/:batchNo/qr-pdf')
  async downloadBatchQRPDF(@Param('batchNo') batchNo: string) {
    return await firstValueFrom(
      this.generalClient.send(PRODUCT_CONSTANTS.GENERATE_BATCH_QR_PDF, { batchNo }),
    );
  }

  @Get('/company/:companyId')
  async getProductsByCompany(@Param('companyId') companyId: number) {
    return await firstValueFrom(
      this.generalClient.send(PRODUCT_CONSTANTS.GET_PRODUCTS_BY_COMPANY, { companyId }),
    );
  }

  @Get(':productId')
  async getProductById(@Param('productId') productId: number) {
    return await firstValueFrom(
      this.generalClient.send(PRODUCT_CONSTANTS.GET_PRODUCT_BY_ID, { productId }),
    );
  }
}
