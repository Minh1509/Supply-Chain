import { Body, Controller, Get, Inject, Param, Post, Put, Query } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { RABBITMQ_CONSTANTS } from 'src/common/constants/rabbitmq.constant';
import { IssueTicketRequestDto } from './dto/issue-ticket-request.dto';
import { IssueReportRequestDto } from './dto/issue-report-request.dto';
import { ISSUE_TICKET_CONSTANTS } from './issue-ticket.constant';

@Controller('/issue-ticket')
@ApiBearerAuth()
@ApiTags('Issue Ticket')
export class IssueTicketController {
  constructor(
    @Inject(RABBITMQ_CONSTANTS.INVENTORY.name) private inventoryClient: ClientProxy,
  ) {}

  @Post()
  async createIssueTicket(@Body() issueTicket: IssueTicketRequestDto) {
    return await firstValueFrom(
      this.inventoryClient.send(ISSUE_TICKET_CONSTANTS.CREATE_ISSUE_TICKET, { issueTicket }),
    );
  }

  @Get('company/:companyId')
  async getAllIssueTicketsByCompany(@Param('companyId') companyId: number) {
    return await firstValueFrom(
      this.inventoryClient.send(ISSUE_TICKET_CONSTANTS.GET_ALL_ISSUE_TICKETS_IN_COMPANY, {
        companyId,
      }),
    );
  }

  @Get(':ticketId')
  async getIssueTicketById(@Param('ticketId') ticketId: number) {
    return await firstValueFrom(
      this.inventoryClient.send(ISSUE_TICKET_CONSTANTS.GET_ISSUE_TICKET_BY_ID, { ticketId }),
    );
  }

  @Put(':ticketId')
  async updateIssueTicket(
    @Param('ticketId') ticketId: number,
    @Body() issueTicket: IssueTicketRequestDto,
  ) {
    return await firstValueFrom(
      this.inventoryClient.send(ISSUE_TICKET_CONSTANTS.UPDATE_ISSUE_TICKET, {
        ticketId,
        issueTicket,
      }),
    );
  }

  @Post('report/:companyId')
  async getIssueReport(
    @Body() issueReport: IssueReportRequestDto,
    @Param('companyId') companyId: number,
  ) {
    return await firstValueFrom(
      this.inventoryClient.send(ISSUE_TICKET_CONSTANTS.GET_ISSUE_REPORT, {
        issueReport,
        companyId,
      }),
    );
  }

  @Get('monthly-report/:companyId')
  async getMonthlyIssueReport(
    @Param('companyId') companyId: number,
    @Query('issueType') issueType?: string,
    @Query('warehouseId') warehouseId?: number,
  ) {
    return await firstValueFrom(
      this.inventoryClient.send(ISSUE_TICKET_CONSTANTS.GET_MONTHLY_ISSUE_REPORT, {
        companyId,
        issueType,
        warehouseId,
      }),
    );
  }

  @Get('forecast/:companyId')
  async getForecastedIssue(
    @Param('companyId') companyId: number,
    @Query('issueType') issueType?: string,
    @Query('warehouseId') warehouseId?: number,
  ) {
    return await firstValueFrom(
      this.inventoryClient.send(ISSUE_TICKET_CONSTANTS.GET_FORECASTED_ISSUE, {
        companyId,
        issueType,
        warehouseId,
      }),
    );
  }
}