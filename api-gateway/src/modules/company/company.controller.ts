import {
  Controller,
  Get,
  HttpStatus,
  Inject,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { RABBITMQ_CONSTANTS } from 'src/common/constants/rabbitmq.constant';
import { SwaggerApiDocument } from 'src/decorators';
import { COMPANY_CONSTANTS } from './company.constant';
import { QueryCompanyDto } from './dto/query-company.dto';
import { ListCompanyResponseDto } from './dto/response/list-company-response.dto';
import { CompanyResponseDto } from '../admin/admin-company/dto/response/company-response.dto';

@Controller('company')
@ApiTags('Company')
@ApiBearerAuth()
export class CompanyController {
  constructor(
    @Inject(RABBITMQ_CONSTANTS.AUTH.name) private readonly authClient: ClientProxy,
  ) {}

  @SwaggerApiDocument({
    operation: {
      summary: `finOne`,
      operationId: `finOne`,
    },
    response: {
      status: HttpStatus.OK,
      type: CompanyResponseDto,
    },
  })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await firstValueFrom(this.authClient.send(COMPANY_CONSTANTS.FIND_ONE, { id }));
  }

  @SwaggerApiDocument({
    operation: {
      summary: `findAllCompany`,
      operationId: `findAllCompany`,
    },
    response: {
      status: HttpStatus.OK,
      type: ListCompanyResponseDto,
    },
  })
  @Get()
  async findAll(@Query() dto: QueryCompanyDto) {
    return await firstValueFrom(this.authClient.send(COMPANY_CONSTANTS.FIND_ALL, dto));
  }
}
