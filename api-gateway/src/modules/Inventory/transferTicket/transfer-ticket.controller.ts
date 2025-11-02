import { Body, Controller, Get, Inject, Param, Post, Put } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { RABBITMQ_CONSTANTS } from 'src/common/constants/rabbitmq.constant';
import { TransferTicketRequestDto } from './dto/transfer-ticket-request.dto';
import { TRANSFER_TICKET_CONSTANTS } from './transfer-ticket.constant';

@Controller('/transfer-ticket')
@ApiBearerAuth()
@ApiTags('Transfer Ticket')
export class TransferTicketController {
  constructor(
    @Inject(RABBITMQ_CONSTANTS.INVENTORY.name) private inventoryClient: ClientProxy,
  ) {}

  @Post()
  async createTicket(@Body() transferTicket: TransferTicketRequestDto) {
    return await firstValueFrom(
      this.inventoryClient.send(TRANSFER_TICKET_CONSTANTS.CREATE_TRANSFER_TICKET, { transferTicket }),
    );
  }

  @Get(':ticketId')
  async getTicketById(@Param('ticketId') ticketId: number) {
    return await firstValueFrom(
      this.inventoryClient.send(TRANSFER_TICKET_CONSTANTS.GET_TRANSFER_TICKET_BY_ID, { ticketId }),
    );
  }

  @Get('code/:ticketCode')
  async getTicketByCode(@Param('ticketCode') ticketCode: string) {
    return await firstValueFrom(
      this.inventoryClient.send(TRANSFER_TICKET_CONSTANTS.GET_TRANSFER_TICKET_BY_CODE, { ticketCode }),
    );
  }

  @Get('company/:companyId')
  async getAllByCompany(@Param('companyId') companyId: number) {
    return await firstValueFrom(
      this.inventoryClient.send(TRANSFER_TICKET_CONSTANTS.GET_ALL_TRANSFER_TICKETS_IN_COMPANY, {
        companyId,
      }),
    );
  }

  @Put(':ticketId')
  async updateTicket(
    @Param('ticketId') ticketId: number,
    @Body() transferTicket: TransferTicketRequestDto,
  ) {
    return await firstValueFrom(
      this.inventoryClient.send(TRANSFER_TICKET_CONSTANTS.UPDATE_TRANSFER_TICKET, {
        ticketId,
        transferTicket,
      }),
    );
  }
}
