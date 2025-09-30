import { ArgumentsHost, Catch } from '@nestjs/common';
import { BaseRpcExceptionFilter, RpcException } from '@nestjs/microservices';

@Catch()
export class AllRpcExceptionsFilter extends BaseRpcExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    // Nếu đã là RpcException thì trả luôn
    if (exception instanceof RpcException) {
      return super.catch(exception, host);
    }

    // Nếu là lỗi runtime (không do mình throw RpcException)
    return super.catch(
      new RpcException({
        message: exception?.message || 'Internal server error',
        statusCode: 500,
        errorCode: 'internal server error',
      }),
      host,
    );
  }
}
