import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './modules/app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const isProduction = process.env.NODE_ENV === 'production';
  const enableSwagger = process.env.ENABLE_SWAGGER !== 'false';
  const enableLogging = process.env.ENABLE_LOGGING !== 'false';

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: isProduction && !enableLogging ? ['error'] : ['error', 'warn', 'log'],
    bufferLogs: isProduction,
  });

  app.enableCors();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      disableErrorMessages: isProduction,
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());

  // In production, public folder is at /app/public
  // In development, it's at project root
  const publicPath = process.env.NODE_ENV === 'production' 
    ? join(__dirname, '..', '..', 'public')
    : join(__dirname, '..', 'public');
  
  app.useStaticAssets(publicPath);
  app.setBaseViewsDir(publicPath);

  // Only enable Swagger in development or when explicitly enabled
  if (!isProduction || enableSwagger) {
    const config = new DocumentBuilder()
      .setTitle('SCMS Chatbot API')
      .setDescription('RAG-based chatbot for Supply Chain Management System')
      .setVersion('3.0')
      .addBearerAuth()
      .addTag('Chat', 'Chat endpoints')
      .addTag('Analytics', 'Analytics endpoints')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = process.env.APP_PORT || 3006;
  await app.listen(port);

  if (!isProduction || enableLogging) {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║  🤖 SCMS Chatbot Service V3                          ║
║  📡 Port: ${port}                                      ║
║  🌐 Web UI: http://localhost:${port}                  ║
║  📚 API Docs: http://localhost:${port}/api/docs       ║
║  🚀 Status: Ready                                     ║
╚═══════════════════════════════════════════════════════╝
    `);
  }
}

bootstrap();
