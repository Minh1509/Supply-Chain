import { Controller, Inject } from '@nestjs/common';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { Channel } from 'amqplib';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { COMPANY_CONSTANTS } from './company.constant';
import { CompanyService } from './company.service';

@Controller()
export class CompanyController {
  constructor(
    private readonly companyService: CompanyService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @MessagePattern('company.find-one')
  async getCompanyById(@Payload() payload: any, @Ctx() context: RmqContext) {
    const channel: Channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    const replyTo = originalMsg.properties.replyTo;
    const correlationId = originalMsg.properties.correlationId;

    const result = await this.companyService.findById(payload.id);

    if (replyTo) {
      this.logger.debug(` Sending manual reply to ${replyTo}`);
      channel.sendToQueue(replyTo, Buffer.from(JSON.stringify(result)), {
        correlationId,
      });
    } else {
      this.logger.warn('No replyTo found — not RPC message');
    }
  }

  @MessagePattern(COMPANY_CONSTANTS.FIND_ALL)
  async getAllCompanies(@Payload() payload: { page?: number; pageSize?: number }) {
    this.logger.debug('CompanyController.getAllCompanies', { payload });
    const { page = 1, pageSize = 10 } = payload;
    return await this.companyService.findAll(page, pageSize);
  }
}
