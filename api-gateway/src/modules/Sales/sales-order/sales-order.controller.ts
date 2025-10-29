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
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { RABBITMQ_CONSTANTS } from 'src/common/constants/rabbitmq.constant';
import { SalesOrderRequestDto } from './dto/sales-order-request.dto';
import { SalesReportRequestDto } from './dto/sales-report-request.dto';
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
  async createSalesOrder(@Body() request: SalesOrderRequestDto) {
    return await firstValueFrom(
      this.businessClient.send(SALES_ORDER_CONSTANTS.CREATE, request),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sales order by ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'Sales Order ID' })
  async getSalesOrderById(@Param('id', ParseIntPipe) id: number) {
    return await firstValueFrom(
      this.businessClient.send(SALES_ORDER_CONSTANTS.GET_BY_ID, { id }),
    );
  }

  @Get('purchase-orders/:poId')
  @ApiOperation({ summary: 'Get sales order by purchase order ID' })
  @ApiParam({ name: 'poId', type: 'number', description: 'Purchase Order ID' })
  async getSalesOrderByPoId(@Param('poId', ParseIntPipe) poId: number) {
    return await firstValueFrom(
      this.businessClient.send(SALES_ORDER_CONSTANTS.GET_BY_PO_ID, { poId }),
    );
  }

  @Get('company/:companyId')
  @ApiOperation({ summary: 'Get all sales orders in company' })
  @ApiParam({ name: 'companyId', type: 'number', description: 'Company ID' })
  async getAllSalesOrdersByCompany(@Param('companyId', ParseIntPipe) companyId: number) {
    return await firstValueFrom(
      this.businessClient.send(SALES_ORDER_CONSTANTS.GET_ALL_IN_COMPANY, { companyId }),
    );
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update sales order status' })
  @ApiParam({ name: 'id', type: 'number', description: 'Sales Order ID' })
  @ApiQuery({ name: 'status', type: 'string', description: 'New status', required: true })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Query('status') status: string,
  ) {
    return await firstValueFrom(
      this.businessClient.send(SALES_ORDER_CONSTANTS.UPDATE_STATUS, {
        id,
        status,
      }),
    );
  }

  @Post('reports/sales/:companyId')
  @ApiOperation({ summary: 'Get sales report' })
  @ApiParam({ name: 'companyId', type: 'number', description: 'Company ID' })
  async getSaleReport(
    @Param('companyId', ParseIntPipe) companyId: number,
    @Body() request: SalesReportRequestDto,
  ) {
    return await firstValueFrom(
      this.businessClient.send(SALES_ORDER_CONSTANTS.SALES_REPORT, {
        companyId,
        ...request,
      }),
    );
  }

  @Get('reports/monthly/:companyId')
  @ApiOperation({ summary: 'Get monthly sales report' })
  @ApiParam({ name: 'companyId', type: 'number', description: 'Company ID' })
  async getMonthlySalesReport(@Param('companyId', ParseIntPipe) companyId: number) {
    return await firstValueFrom(
      this.businessClient.send(SALES_ORDER_CONSTANTS.MONTHLY_REPORT, { companyId }),
    );
  }
}
