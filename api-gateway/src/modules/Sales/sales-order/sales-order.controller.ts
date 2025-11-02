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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { RABBITMQ_CONSTANTS } from 'src/common/constants/rabbitmq.constant';
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
  async createSalesOrder(@Body() request: SalesOrderRequestDto) {
    return await firstValueFrom(
      this.businessClient.send(SALES_ORDER_CONSTANTS.CREATE, request),
    );
  }

  @Get(':soId')
  @ApiOperation({ summary: 'Get sales order by ID' })
  @ApiParam({ name: 'soId', type: 'number', description: 'Sales Order ID' })
  async getSalesOrderById(@Param('soId', ParseIntPipe) soId: number) {
    return await firstValueFrom(
      this.businessClient.send(SALES_ORDER_CONSTANTS.GET_BY_ID, { soId }),
    );
  }

  @Get('/code/:soCode')
  @ApiOperation({ summary: 'Get sales order by code' })
  @ApiParam({ name: 'soCode', type: 'string', description: 'Sales Order Code' })
  async getSalesOrderByCode(@Param('soCode') soCode: string) {
    return await firstValueFrom(
      this.businessClient.send(SALES_ORDER_CONSTANTS.GET_BY_CODE, { soCode }),
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

  @Put(':soId/status')
  @ApiOperation({ summary: 'Update sales order status' })
  @ApiParam({ name: 'soId', type: 'number', description: 'Sales Order ID' })
  async updateStatus(
    @Param('soId', ParseIntPipe) soId: number,
    @Body() body: UpdateStatusRequestDto,
  ) {
    return await firstValueFrom(
      this.businessClient.send(SALES_ORDER_CONSTANTS.UPDATE_STATUS, { soId, body }),
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
        request,
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
