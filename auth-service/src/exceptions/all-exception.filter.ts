import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';
import _ from 'lodash';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ERROR_RESPONSE } from 'src/common/constants';
import { HttpErrorResponseDto } from 'src/common/dto';
import { convertErrorToObject } from 'src/common/utilities';
import { Logger } from 'winston';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly configService: ConfigService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const isHttpException = exception instanceof HttpException;
    const httpStatus = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const errorData: Partial<HttpErrorResponseDto> = {
      statusCode: HttpStatus.BAD_REQUEST,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (isHttpException) {
      let exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        exceptionResponse = { message: exceptionResponse };
      }
      _.assign(errorData, { statusCode: exception.getStatus() }, exceptionResponse);
    } else {
      this.logger.error({
        context: `AllExceptionFilter.catch`,
        error: exception,
        message: `A non-http error being throw somewhere`,
      });

      _.assign(errorData, {
        ...ERROR_RESPONSE.INTERNAL_SERVER_ERROR,
        details: convertErrorToObject(exception),
      });
    }

    // Remove error details in production
    const isProductionEnv = this.configService.get<string>('app.isProductionEnv');
    isProductionEnv && delete errorData.details;

    httpAdapter.reply(ctx.getResponse(), errorData, httpStatus);
  }
}
