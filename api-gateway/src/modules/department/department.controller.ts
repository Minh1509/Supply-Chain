import { Controller, Get, HttpStatus, Inject, Param, ParseIntPipe } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { RABBITMQ_CONSTANTS } from 'src/common/constants/rabbitmq.constant';
import { SwaggerApiDocument } from 'src/decorators';
import { DEPARTMENT_CONSTANTS } from './department.constant';
import { DepartmentResponseDto } from './dto/response/department-response.dto';

@Controller('departments')
@ApiTags('Department')
@ApiBearerAuth()
export class DepartmentController {
  constructor(
    @Inject(RABBITMQ_CONSTANTS.AUTH.name) private readonly authClient: ClientProxy,
  ) {}

  @SwaggerApiDocument({
    operation: {
      summary: `findOne`,
      operationId: `findOne`,
    },
    response: {
      status: HttpStatus.OK,
      type: DepartmentResponseDto,
    },
  })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await firstValueFrom(
      this.authClient.send(DEPARTMENT_CONSTANTS.FIND_BY_ID, { id }),
    );
  }

  @SwaggerApiDocument({
    operation: {
      summary: `findByCompanyId`,
      operationId: `findByCompanyId`,
    },
    response: {
      status: HttpStatus.OK,
      type: [DepartmentResponseDto],
    },
  })
  @Get('company/:id')
  async findByCompanyId(@Param('id', ParseIntPipe) id: number) {
    return await firstValueFrom(
      this.authClient.send(DEPARTMENT_CONSTANTS.FIND_BY_COMPANY, { id }),
    );
  }
}
