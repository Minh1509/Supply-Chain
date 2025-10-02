import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { RABBITMQ_CONSTANTS } from 'src/common/constants/rabbitmq.constant';
import { UploadResponseDto } from 'src/common/dto/upload-response.dto';
import { SwaggerApiDocument } from 'src/decorators';
import { EmployeeUserDto } from './dto/employee-user.dto';
import { EMPLOYEE_CONSTANTS } from './employee.constant';
import { EmployeeResponseDto } from '../admin/admin-employee/dto/response/employee-response.dto';

@Controller('employees')
@ApiTags('Employees')
@ApiBearerAuth()
export class EmployeeController {
  constructor(
    @Inject(RABBITMQ_CONSTANTS.AUTH.name) private readonly authClient: ClientProxy,
  ) {}

  @SwaggerApiDocument({
    operation: {
      summary: `fineOne`,
      operationId: `fineOne`,
    },
    response: {
      status: HttpStatus.OK,
      type: EmployeeResponseDto,
    },
  })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await firstValueFrom(
      this.authClient.send(EMPLOYEE_CONSTANTS.GET_BY_ID, { id }),
    );
  }

  @SwaggerApiDocument({
    operation: {
      summary: `findByCompanyId`,
      operationId: `findByCompanyId`,
    },
    response: {
      status: HttpStatus.OK,
      type: [EmployeeResponseDto],
    },
  })
  @Get('company/:id')
  async findByCompany(@Param('id', ParseIntPipe) id: number) {
    return await firstValueFrom(
      this.authClient.send(EMPLOYEE_CONSTANTS.GET_BY_COMPANY, { id }),
    );
  }

  @SwaggerApiDocument({
    operation: {
      summary: `update employee`,
      operationId: `update employee`,
    },
    response: {
      status: HttpStatus.OK,
      type: EmployeeResponseDto,
    },
  })
  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: EmployeeUserDto) {
    return await firstValueFrom(
      this.authClient.send(EMPLOYEE_CONSTANTS.UPDATE, { id, body }),
    );
  }

  @Post(':id/avatar')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOperation({
    summary: `[Admin] updateAvatarEmployee`,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: UploadResponseDto,
  })
  async uploadLogo(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return await firstValueFrom(
      this.authClient.send(EMPLOYEE_CONSTANTS.UPDATE_AVATAR, { id, file }),
    );
  }
}
