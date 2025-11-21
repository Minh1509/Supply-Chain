import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatModule } from './chat/chat.module';
import { RagModule } from './rag/rag.module';
import { IntentModule } from './intent/intent.module';
import { ActionsModule } from './actions/actions.module';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';
import { ConversationModule } from './conversation/conversation.module';
import { PersonalizationModule } from './personalization/personalization.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { HealthModule } from './health/health.module';
import { AppController } from './app.controller';
import { databaseConfig } from '../config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.docker', '.env'],
      load: [() => ({ database: databaseConfig })],
    }),
    TypeOrmModule.forRoot(databaseConfig),
    HealthModule,
    ChatModule,
    RagModule,
    IntentModule,
    ActionsModule,
    RabbitmqModule,
    ConversationModule,
    PersonalizationModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
