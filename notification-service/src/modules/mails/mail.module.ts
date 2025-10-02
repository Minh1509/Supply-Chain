import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { SmtpMailService } from './smtp-mail.service';
import { MailController } from './mail.controller';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { smtpConfiguration } from 'src/config';

@Module({
  imports: [
    ConfigModule.forRoot({ load: [smtpConfiguration] }),
    MailerModule.forRootAsync({
      inject: [smtpConfiguration.KEY],
      useFactory: (smtpConfig: ConfigType<typeof smtpConfiguration>) => ({
        transport: {
          host: smtpConfig.MAIL_HOST,
          port: smtpConfig.MAIL_PORT,
          secure: smtpConfig.MAIL_SECURE,
          auth: {
            user: smtpConfig.MAIL_USERNAME,
            pass: smtpConfig.MAIL_PASSWORD,
          },
        },
        defaults: {
          from: `"Supply Chain" <${smtpConfig.MAIL_SENDER}>`,
        },

        template: {
          dir: join(__dirname, './templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  controllers: [MailController],
  providers: [SmtpMailService],
  exports: [SmtpMailService],
})
export class MailModule {}
