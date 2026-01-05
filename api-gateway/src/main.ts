import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import { WinstonModule } from 'nest-winston';
import { setupSwagger } from './common/docs';
import { getWinstonConfig } from './common/utilities';
import { getAppConfig } from './config';
import { HttpExceptionFilter } from './exceptions/http-exception.filter';
import { AppModule } from './modules/app.module';

async function bootstrap() {
  const { appName, appPort, isProductionEnv, trustProxy } = getAppConfig();
  const logger = WinstonModule.createLogger(getWinstonConfig(appName));
  const app = await NestFactory.create(AppModule, {
    logger: logger,
    rawBody: true,
  });

  // app.use(helmet());
  app.use(morgan('dev'));

  app.getHttpAdapter().getInstance().set('trust proxy', trustProxy);
  app.use(
    rateLimit({
      windowMs: 60 * 1000, // 1 minutes
      max: 5000, // limit each IP to 100 requests per windowMs
      standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    }),
  );

  // CORS
  app.enableCors({
    origin: true, // tự động phản hồi lại đúng Origin của request (tốt hơn '*')
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true, // cho phép gửi cookie / Authorization header
  });

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const reflector = app.get(Reflector);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));

  setupSwagger(app);

  await app.listen(appPort);
  {
    !isProductionEnv &&
      logger.log({
        message: `Application is ready. View Swagger at http://localhost:${appPort}/swagger`,
        context: 'Application',
      });
  }
}

bootstrap();
