import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { RABBITMQ_CONSTANTS } from 'src/common/constants/rabbitmq.constant';
import { PurchaseOrderRequestDto } from './dto/purchase-order-request.dto';
import { PurchaseReportRequestDto } from './dto/purchase-report-request.dto';
import { PURCHASE_ORDER_CONSTANTS } from './purchase-order.constant';
import { UpdateStatusRequestDto } from '../request-for-quotation/dto/update-status-request.dto';

@Controller('purchase-orders')
@ApiBearerAuth()
@ApiTags('Purchase Order')
export class PurchaseOrderController {
  constructor(
    @Inject(RABBITMQ_CONSTANTS.BUSINESS.name) private businessClient: ClientProxy,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create purchase order' })
  async create(@Body() request: PurchaseOrderRequestDto) {
    return await firstValueFrom(
      this.businessClient.send(PURCHASE_ORDER_CONSTANTS.CREATE, request),
    );
  }

  @Get('company/:companyId')
  @ApiOperation({ summary: 'Get all purchase orders in company' })
  async getAllPoInCompany(@Param('companyId', ParseIntPipe) companyId: number) {
    return await firstValueFrom(
      this.businessClient.send(PURCHASE_ORDER_CONSTANTS.GET_ALL_IN_COMPANY, {
        companyId,
      }),
    );
  }

  @Get('supplier/:supplierCompanyId')
  @ApiOperation({ summary: 'Get all purchase orders by supplier company' })
  async getAllPoBySupplier(
    @Param('supplierCompanyId', ParseIntPipe) supplierCompanyId: number,
  ) {
    return await firstValueFrom(
      this.businessClient.send(PURCHASE_ORDER_CONSTANTS.GET_ALL_BY_SUPPLIER, {
        supplierCompanyId,
      }),
    );
  }

  @Get(':poId')
  @ApiOperation({ summary: 'Get purchase order by ID' })
  async getPoById(@Param('poId', ParseIntPipe) poId: number) {
    return await firstValueFrom(
      this.businessClient.send(PURCHASE_ORDER_CONSTANTS.GET_BY_ID, { poId }),
    );
  }

  @Put(':poId/status')
  @ApiOperation({ summary: 'Update purchase order status' })
  async updateStatus(
    @Param('poId', ParseIntPipe) poId: number,
    @Body() body: UpdateStatusRequestDto,
  ) {
    return await firstValueFrom(
      this.businessClient.send(PURCHASE_ORDER_CONSTANTS.UPDATE_STATUS, {
        poId,
        body,
      }),
    );
  }

  @Post('reports/purchase/:companyId')
  @ApiOperation({ summary: 'Get purchase report' })
  async getPurchaseReport(
    @Param('companyId', ParseIntPipe) companyId: number,
    @Body() request: PurchaseReportRequestDto,
  ) {
    return await firstValueFrom(
      this.businessClient.send(PURCHASE_ORDER_CONSTANTS.PURCHASE_REPORT, {
        companyId,
        request,
      }),
    );
  }

  @Get('reports/monthly/:companyId')
  @ApiOperation({ summary: 'Get monthly purchase report' })
  async getMonthlyPurchaseReport(@Param('companyId', ParseIntPipe) companyId: number) {
    return await firstValueFrom(
      this.businessClient.send(PURCHASE_ORDER_CONSTANTS.MONTHLY_REPORT, {
        companyId,
      }),
    );
  }
}
