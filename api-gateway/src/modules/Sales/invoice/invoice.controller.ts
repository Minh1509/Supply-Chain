import {
  Controller,
  Get,
  Header,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { RABBITMQ_CONSTANTS } from 'src/common/constants/rabbitmq.constant';
import { INVOICE_CONSTANTS } from './invoice.constant';

@Controller('invoices')
@ApiBearerAuth()
@ApiTags('Invoice')
export class InvoiceController {
  constructor(
    @Inject(RABBITMQ_CONSTANTS.BUSINESS.name) private businessClient: ClientProxy,
  ) {}

  @Post('sales-orders/:soId')
  @ApiOperation({ summary: 'Create invoice' })
  async create(@Param('soId', ParseIntPipe) soId: number) {
    return await firstValueFrom(
      this.businessClient.send(INVOICE_CONSTANTS.CREATE, { soId }),
    );
  }

  @Get('sales-orders/:soId/pdf')
  @ApiOperation({ summary: 'Download PDF by sales order' })
  @Header('Content-Type', 'application/pdf')
  async downloadPdfBySalesOrder(
    @Param('soId', ParseIntPipe) soId: number,
    @Res() res: Response,
  ) {
    const invoice: any = await firstValueFrom(
      this.businessClient.send(INVOICE_CONSTANTS.GET_BY_SO_ID, { soId }),
    );

    if (!invoice || !invoice.file) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const buffer = Buffer.from(invoice.file);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${invoice.invoiceCode}.pdf"`);
    res.send(buffer);
  }

  @Get('sales-orders/:soId')
  @ApiOperation({ summary: 'Get by sales order' })
  async findBySalesOrder(@Param('soId', ParseIntPipe) soId: number) {
    return await firstValueFrom(
      this.businessClient.send(INVOICE_CONSTANTS.GET_BY_SO_ID, { soId }),
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all invoices' })
  @ApiQuery({ name: 'companyId', required: true, type: Number })
  async findAll(@Query('companyId', ParseIntPipe) companyId: number) {
    return await firstValueFrom(
      this.businessClient.send(INVOICE_CONSTANTS.GET_ALL_IN_COMPANY, { companyId }),
    );
  }

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Download PDF by ID' })
  @Header('Content-Type', 'application/pdf')
  async downloadPdf(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const invoice: any = await firstValueFrom(
      this.businessClient.send(INVOICE_CONSTANTS.GET_BY_ID, { id }),
    );

    if (!invoice || !invoice.file) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const buffer = Buffer.from(invoice.file);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${invoice.invoiceCode}.pdf"`);
    res.send(buffer);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await firstValueFrom(
      this.businessClient.send(INVOICE_CONSTANTS.GET_BY_ID, { id }),
    );
  }
}
