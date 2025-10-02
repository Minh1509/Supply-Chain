import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  appConfiguration,
  rabbitmqConfiguration,
  smtpConfiguration,
} from './config';
import { MailModule } from './modules/mails/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfiguration, rabbitmqConfiguration, smtpConfiguration],
    }),
    MailModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
