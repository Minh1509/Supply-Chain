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
import { MonthlyReportRequestDto } from './dto/monthly-report-request.dto';
import { PurchaseOrderRequestDto } from './dto/purchase-order-request.dto';
import { PurchaseReportRequestDto } from './dto/purchase-report-request.dto';
import { UpdateStatusRequestDto } from './dto/update-status-request.dto';
import { PURCHASE_ORDER_CONSTANTS } from './purchase-order.constant';

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

  @Post('reports/purchase')
  @ApiOperation({ summary: 'Get purchase report' })
  async getPurchaseReport(@Body() request: PurchaseReportRequestDto) {
    return await firstValueFrom(
      this.businessClient.send(PURCHASE_ORDER_CONSTANTS.PURCHASE_REPORT, request),
    );
  }

  @Post('reports/monthly')
  @ApiOperation({ summary: 'Get monthly report' })
  async getMonthlyReport(@Body() request: MonthlyReportRequestDto) {
    return await firstValueFrom(
      this.businessClient.send(PURCHASE_ORDER_CONSTANTS.MONTHLY_REPORT, request),
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all purchase orders' })
  @ApiQuery({ name: 'companyId', required: false, type: Number })
  @ApiQuery({ name: 'supplierCompanyId', required: false, type: Number })
  async findAll(
    @Query('companyId') companyId?: number,
    @Query('supplierCompanyId') supplierCompanyId?: number,
  ) {
    if (companyId) {
      return await firstValueFrom(
        this.businessClient.send(PURCHASE_ORDER_CONSTANTS.GET_ALL_IN_COMPANY, {
          companyId: Number(companyId),
        }),
      );
    }

    if (supplierCompanyId) {
      return await firstValueFrom(
        this.businessClient.send(PURCHASE_ORDER_CONSTANTS.GET_ALL_BY_SUPPLIER, {
          supplierCompanyId: Number(supplierCompanyId),
        }),
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get purchase order by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await firstValueFrom(
      this.businessClient.send(PURCHASE_ORDER_CONSTANTS.GET_BY_ID, { id }),
    );
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update status' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateStatusRequestDto,
  ) {
    return await firstValueFrom(
      this.businessClient.send(PURCHASE_ORDER_CONSTANTS.UPDATE_STATUS, {
        id,
        status: body.status,
      }),
    );
  }
}
