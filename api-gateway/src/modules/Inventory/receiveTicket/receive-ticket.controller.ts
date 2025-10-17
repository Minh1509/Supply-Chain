import { Body, Controller, Get, Inject, Param, Post, Put, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { RABBITMQ_CONSTANTS } from 'src/common/constants/rabbitmq.constant';
import { ReceiveTicketRequestDto } from './dto/receive-ticket-request.dto';
import { ReceiveReportRequestDto } from './dto/receive-report-request.dto';
import { RECEIVE_TICKET_CONSTANTS } from './receive-ticket.constant';

@Controller('/receive-ticket')
@ApiBearerAuth()
@ApiTags('Receive Ticket')
export class ReceiveTicketController {
  constructor(
    @Inject(RABBITMQ_CONSTANTS.INVENTORY.name) private inventoryClient: ClientProxy,
  ) {}

  @Post()
  async createReceiveTicket(@Body() request: ReceiveTicketRequestDto) {
    return await firstValueFrom(
      this.inventoryClient.send(RECEIVE_TICKET_CONSTANTS.CREATE_RECEIVE_TICKET, { request }),
    );
  }

  @Get(':ticketId')
  async getReceiveTicket(@Param('ticketId') ticketId: number) {
    return await firstValueFrom(
      this.inventoryClient.send(RECEIVE_TICKET_CONSTANTS.GET_RECEIVE_TICKET_BY_ID, { ticketId }),
    );
  }

  @Get('company/:companyId')
  async getAllReceiveTicketInCompany(@Param('companyId') companyId: number) {
    return await firstValueFrom(
      this.inventoryClient.send(RECEIVE_TICKET_CONSTANTS.GET_ALL_RECEIVE_TICKETS_IN_COMPANY, {
        companyId,
      }),
    );
  }

  @Put(':ticketId')
  async updateReceiveTicket(
    @Param('ticketId') ticketId: number,
    @Body() request: ReceiveTicketRequestDto,
  ) {
    return await firstValueFrom(
      this.inventoryClient.send(RECEIVE_TICKET_CONSTANTS.UPDATE_RECEIVE_TICKET, {
        ticketId,
        request,
      }),
    );
  }

  @Post('report/:companyId')
  async getReceiveReport(
    @Body() request: ReceiveReportRequestDto,
    @Param('companyId') companyId: number,
  ) {
    return await firstValueFrom(
      this.inventoryClient.send(RECEIVE_TICKET_CONSTANTS.GET_RECEIVE_REPORT, {
        request,
        companyId,
      }),
    );
  }

  @Get('monthly-report/:companyId')
  async getMonthlyReceiveReport(
    @Param('companyId') companyId: number,
    @Query('receiveType') receiveType?: string,
    @Query('warehouseId') warehouseId?: number,
  ) {
    return await firstValueFrom(
      this.inventoryClient.send(RECEIVE_TICKET_CONSTANTS.GET_MONTHLY_RECEIVE_REPORT, {
        companyId,
        receiveType,
        warehouseId,
      }),
    );
  }
}
