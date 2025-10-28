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
import { QuotationRequestDto } from './dto/quotation-request.dto';
import { UpdateStatusRequestDto } from './dto/update-status-request.dto';
import { QUOTATION_CONSTANTS } from './quotation.constant';

@Controller('quotations')
@ApiBearerAuth()
@ApiTags('Quotation')
export class QuotationController {
  constructor(
    @Inject(RABBITMQ_CONSTANTS.BUSINESS.name) private businessClient: ClientProxy,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create quotation' })
  async create(@Body() request: QuotationRequestDto) {
    return await firstValueFrom(
      this.businessClient.send(QUOTATION_CONSTANTS.CREATE, request),
    );
  }

  @Get('rfq/:rfqId')
  @ApiOperation({ summary: 'Get by RFQ' })
  async findByRfq(@Param('rfqId', ParseIntPipe) rfqId: number) {
    return await firstValueFrom(
      this.businessClient.send(QUOTATION_CONSTANTS.GET_BY_RFQ_ID, { rfqId }),
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all quotations' })
  @ApiQuery({ name: 'companyId', required: false, type: Number })
  @ApiQuery({ name: 'requestCompanyId', required: false, type: Number })
  async findAll(
    @Query('companyId') companyId?: number,
    @Query('requestCompanyId') requestCompanyId?: number,
  ) {
    if (companyId) {
      return await firstValueFrom(
        this.businessClient.send(QUOTATION_CONSTANTS.GET_ALL_IN_COMPANY, {
          companyId: Number(companyId),
        }),
      );
    }

    if (requestCompanyId) {
      return await firstValueFrom(
        this.businessClient.send(QUOTATION_CONSTANTS.GET_ALL_BY_REQUEST_COMPANY, {
          requestCompanyId: Number(requestCompanyId),
        }),
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get quotation by ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await firstValueFrom(
      this.businessClient.send(QUOTATION_CONSTANTS.GET_BY_ID, { id }),
    );
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update status' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateStatusRequestDto,
  ) {
    return await firstValueFrom(
      this.businessClient.send(QUOTATION_CONSTANTS.UPDATE_STATUS, {
        id,
        status: body.status,
      }),
    );
  }
}
