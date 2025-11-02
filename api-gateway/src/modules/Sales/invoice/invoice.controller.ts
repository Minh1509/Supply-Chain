import {
  Controller,
  Get,
  Header,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Res,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Create invoice from sales order' })
  @ApiParam({ name: 'soId', type: 'number', description: 'Sales Order ID' })
  async createInvoice(@Param('soId', ParseIntPipe) soId: number) {
    return await firstValueFrom(
      this.businessClient.send(INVOICE_CONSTANTS.CREATE, { soId }),
    );
  }

  @Get(':invoiceId/pdf')
  @ApiOperation({ summary: 'Get invoice PDF by invoice ID' })
  @ApiParam({ name: 'invoiceId', type: 'number', description: 'Invoice ID' })
  @Header('Content-Type', 'application/pdf')
  async getInvoicePdf(@Param('invoiceId', ParseIntPipe) invoiceId: number, @Res() res: Response) {
    const invoice: any = await firstValueFrom(
      this.businessClient.send(INVOICE_CONSTANTS.GET_PDF_BY_ID, { invoiceId }),
    );

    if (!invoice || !invoice.file) {
      return res.status(404).json({ error: 'Không tìm thấy hóa đơn!' });
    }

    const buffer = Buffer.from(invoice.file);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${invoice.invoiceCode}.pdf"`);
    res.send(buffer);
  }

  @Get('sales-orders/:soId')
  @ApiOperation({ summary: 'Get invoice PDF by sales order ID' })
  @ApiParam({ name: 'soId', type: 'number', description: 'Sales Order ID' })
  @Header('Content-Type', 'application/pdf')
  async getInvoice(@Param('soId', ParseIntPipe) soId: number, @Res() res: Response) {
    const invoice: any = await firstValueFrom(
      this.businessClient.send(INVOICE_CONSTANTS.GET_PDF_BY_SO_ID, { soId }),
    );

    if (!invoice || !invoice.file) {
      return res.status(404).json({ error: 'Không tìm thấy hóa đơn!' });
    }

    const buffer = Buffer.from(invoice.file);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${invoice.invoiceCode}.pdf"`);
    res.send(buffer);
  }
}
