import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { SmtpMailService } from './smtp-mail.service';
import { MAIL_CONSTANTS } from './mail.constant';

@Controller()
export class MailController {
  private readonly logger = new Logger(MailController.name);

  constructor(private readonly smtpMailService: SmtpMailService) {}

  @EventPattern(MAIL_CONSTANTS.VERIFY_OTP)
  async sendMailStatusOrder(
    @Payload() data: { to: string; otp: number; expires: string },
  ) {
    this.logger.debug(`Nhận yêu cầu gửi mail đến: ${data.to}`);
    return await this.smtpMailService.sendMailVerifyOtp(
      data.to,
      data.otp,
      data.expires,
    );
  }
}
