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
import { RequestForQuotationRequestDto } from './dto/request-for-quotation-request.dto';
import { UpdateStatusRequestDto } from './dto/update-status-request.dto';
import { REQUEST_FOR_QUOTATION_CONSTANTS } from './request-for-quotation.constant';

@Controller('request-for-quotations')
@ApiBearerAuth()
@ApiTags('Request For Quotation')
export class RequestForQuotationController {
  constructor(
    @Inject(RABBITMQ_CONSTANTS.BUSINESS.name) private businessClient: ClientProxy,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create RFQ' })
  async create(@Body() request: RequestForQuotationRequestDto) {
    return await firstValueFrom(
      this.businessClient.send(REQUEST_FOR_QUOTATION_CONSTANTS.CREATE, request),
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all RFQs' })
  @ApiQuery({ name: 'companyId', required: false, type: Number })
  @ApiQuery({ name: 'requestedCompanyId', required: false, type: Number })
  async findAll(
    @Query('companyId') companyId?: number,
    @Query('requestedCompanyId') requestedCompanyId?: number,
  ) {
    if (companyId) {
      return await firstValueFrom(
        this.businessClient.send(REQUEST_FOR_QUOTATION_CONSTANTS.GET_ALL_IN_COMPANY, {
          companyId: Number(companyId),
        }),
      );
    }

    if (requestedCompanyId) {
      return await firstValueFrom(
        this.businessClient.send(
          REQUEST_FOR_QUOTATION_CONSTANTS.GET_ALL_BY_REQUESTED_COMPANY,
          {
            requestedCompanyId: Number(requestedCompanyId),
          },
        ),
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get RFQ by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await firstValueFrom(
      this.businessClient.send(REQUEST_FOR_QUOTATION_CONSTANTS.GET_BY_ID, { id }),
    );
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update status' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateStatusRequestDto,
  ) {
    return await firstValueFrom(
      this.businessClient.send(REQUEST_FOR_QUOTATION_CONSTANTS.UPDATE_STATUS, {
        id,
        status: body.status,
      }),
    );
  }
}
