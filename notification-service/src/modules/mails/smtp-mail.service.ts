import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class SmtpMailService {
  private readonly logger = new Logger(SmtpMailService.name);
  constructor(private readonly mailerService: MailerService) {}

  async sendMailVerifyOtp(to: string, otp: number, expireMinutes = '5m') {
    try {
      await this.mailerService.sendMail({
        to,
        subject: 'Xác thực OTP của bạn',
        template: './verify-otp',
        context: {
          otp,
          expireMinutes,
          email: to,
        },
      });

      this.logger.debug(`OTP mail sent successfully to "${to}"`);
    } catch (error) {
      this.logger.error(`Failed to send OTP mail to "${to}"`);
      throw error;
    }
  }
}
