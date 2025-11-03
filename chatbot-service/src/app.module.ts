import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  appConfiguration,
  rabbitmqConfiguration,
  redisConfiguration,
  openaiConfiguration,
  sessionConfiguration,
} from './config';
import { ChatModule } from './modules/chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        appConfiguration,
        rabbitmqConfiguration,
        redisConfiguration,
        openaiConfiguration,
        sessionConfiguration,
      ],
    }),
    ChatModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
