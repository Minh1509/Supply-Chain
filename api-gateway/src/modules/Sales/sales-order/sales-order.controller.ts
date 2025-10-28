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
import { SalesOrderRequestDto } from './dto/sales-order-request.dto';
import { SalesReportRequestDto } from './dto/sales-report-request.dto';
import { UpdateStatusRequestDto } from './dto/update-status-request.dto';
import { SALES_ORDER_CONSTANTS } from './sales-order.constant';

@Controller('sales-orders')
@ApiBearerAuth()
@ApiTags('Sales Order')
export class SalesOrderController {
  constructor(
    @Inject(RABBITMQ_CONSTANTS.BUSINESS.name) private businessClient: ClientProxy,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create sales order' })
  async create(@Body() request: SalesOrderRequestDto) {
    return await firstValueFrom(
      this.businessClient.send(SALES_ORDER_CONSTANTS.CREATE, request),
    );
  }

  @Post('reports/sales')
  @ApiOperation({ summary: 'Get sales report' })
  async getSalesReport(@Body() request: SalesReportRequestDto) {
    return await firstValueFrom(
      this.businessClient.send(SALES_ORDER_CONSTANTS.SALES_REPORT, request),
    );
  }

  @Post('reports/monthly')
  @ApiOperation({ summary: 'Get monthly report' })
  async getMonthlyReport(@Body() request: MonthlyReportRequestDto) {
    return await firstValueFrom(
      this.businessClient.send(SALES_ORDER_CONSTANTS.MONTHLY_REPORT, request),
    );
  }

  @Get('purchase-orders/:poId')
  @ApiOperation({ summary: 'Get by purchase order' })
  async findByPurchaseOrder(@Param('poId', ParseIntPipe) poId: number) {
    return await firstValueFrom(
      this.businessClient.send(SALES_ORDER_CONSTANTS.GET_BY_PO_ID, { poId }),
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all sales orders' })
  @ApiQuery({ name: 'companyId', required: true, type: Number })
  async findAll(@Query('companyId', ParseIntPipe) companyId: number) {
    return await firstValueFrom(
      this.businessClient.send(SALES_ORDER_CONSTANTS.GET_ALL_IN_COMPANY, { companyId }),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sales order by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await firstValueFrom(
      this.businessClient.send(SALES_ORDER_CONSTANTS.GET_BY_ID, { id }),
    );
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update status' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateStatusRequestDto,
  ) {
    return await firstValueFrom(
      this.businessClient.send(SALES_ORDER_CONSTANTS.UPDATE_STATUS, {
        id,
        status: body.status,
      }),
    );
  }
}
