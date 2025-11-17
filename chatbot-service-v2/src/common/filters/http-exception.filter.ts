import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal server error' };

    // Log full error details for debugging
    console.error('Exception caught:', {
      path: request.url,
      method: request.method,
      body: request.body,
      status,
      message,
      stack: exception instanceof Error ? exception.stack : 'No stack trace',
    });

    response.status(status).json({
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      ...(typeof message === 'string' ? { message } : message),
    });
  }
}
