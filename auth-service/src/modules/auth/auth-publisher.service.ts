import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { RABBITMQ_CONSTANTS } from 'src/common/constants/rabbitmq.constant';
import { Logger } from 'winston';
import { EVENT_CONSTANTS } from './auth.constants';

export interface VerifyOtpPayload {
  to: string;
  otp: number;
  expires: string;
}

@Injectable()
export class AuthPublisherService {
  constructor(
    @Inject(RABBITMQ_CONSTANTS.NOTIFICATION.name) private notificationClient: ClientProxy,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  sendVerifyOtp(email: string, otp: number, expires: string): void {
    const payload: VerifyOtpPayload = {
      to: email,
      otp,
      expires,
    };

    try {
      this.notificationClient.emit(EVENT_CONSTANTS.VERIFY_OTP, payload);
      this.logger.debug(
        `OTP notification queued for email: ${email} with event: ${EVENT_CONSTANTS.VERIFY_OTP}`,
        {
          context: 'AuthPublisher',
        },
      );
    } catch (error) {
      this.logger.error(`Failed to send OTP notification to ${email}`, {
        context: 'AuthPublisher',
        error: error.message,
      });
    }
  }
}
