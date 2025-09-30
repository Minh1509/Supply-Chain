import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { RABBITMQ_CONSTANTS } from 'src/common/constants/rabbitmq.constant';
import { Logger } from 'winston';

export interface NotificationPayload {
  userId: string;
  email: string;
  type: 'OTP_VERIFICATION' | 'WELCOME' | 'PASSWORD_RESET' | 'ACCOUNT_LOCKED';
  data?: {
    otp?: number;
    companyName?: string;
    userName?: string;
    [key: string]: any;
  };
}

@Injectable()
export class AuthPublisherService {
  constructor(
    @Inject(RABBITMQ_CONSTANTS.NOTIFICATION.name) private notificationClient: ClientProxy,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async sendOtpNotification(
    userId: string,
    email: string,
    otp: number,
    companyName?: string,
  ): Promise<void> {
    const payload: NotificationPayload = {
      userId,
      email,
      type: 'OTP_VERIFICATION',
      data: {
        otp,
        companyName,
      },
    };

    try {
      this.notificationClient.emit('notification.send', payload);
      this.logger.info(`OTP notification queued for email: ${email}`, {
        context: 'AuthPublisher',
      });
    } catch (error) {
      this.logger.error(`Failed to send OTP notification to ${email}`, {
        context: 'AuthPublisher',
        error: error.message,
      });
    }
  }
}
