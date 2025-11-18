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

    // Skip logging for common static asset 404s
    const skipLogging = status === 404 && (
      request.url.includes('/favicon.ico') ||
      request.url.includes('.map') ||
      request.url.includes('/robots.txt')
    );

    // Log full error details for debugging (except skipped paths)
    if (!skipLogging) {
      console.error('Exception caught:', {
        path: request.url,
        method: request.method,
        body: request.body,
        status,
        message,
        stack: exception instanceof Error ? exception.stack : 'No stack trace',
      });
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      ...(typeof message === 'string' ? { message } : message),
    });
  }
}
