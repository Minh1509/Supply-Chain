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
  ) {}

  @Post(':itemId')
  async createProduct(
    @Param('itemId') itemId: number,
    @Body() product: ProductRequestDto,
  ) {
    return await firstValueFrom(
      this.generalClient.send(PRODUCT_CONSTANTS.CREATE_PRODUCT, { itemId, product }),
    );
  }

  @Get(':itemId')
  async getAllProductsByItem(@Param('itemId') itemId: number) {
    return await firstValueFrom(
      this.generalClient.send(PRODUCT_CONSTANTS.GET_ALL_PRODUCTS_IN_ITEM, { itemId }),
    );
  }
  @Get(':productId')
  async getProductById(@Param('productId') productId: number) {
    return await firstValueFrom(
      this.generalClient.send(PRODUCT_CONSTANTS.GET_PRODUCT_BY_ID, { productId }),
    );
  }

  @Put(':productId')
  async updateProduct(
    @Param('productId') productId: number,
    @Body() product: ProductRequestDto,
  ) {
    return await firstValueFrom(
      this.generalClient.send(PRODUCT_CONSTANTS.UPDATE_PRODUCT, { productId, product }),
    );
  }

  @Delete(':productId')
  async deleteProduct(@Param('productId') productId: number) {
    return await firstValueFrom(
      this.generalClient.send(PRODUCT_CONSTANTS.DELETE_PRODUCT, { productId }),
    );
  }
}
