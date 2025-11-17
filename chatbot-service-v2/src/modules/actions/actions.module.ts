import { Module } from '@nestjs/common';
import { ActionExecutorService } from './action-executor.service';
import { GeneralActionService } from './general-action.service';
import { RabbitmqModule } from '../rabbitmq/rabbitmq.module';
import { InventoryActionService } from './inventory-action.service';
import { BusinessActionService } from './business-action.service';
import { OperationActionService } from './operation-action.service';

@Module({
  imports: [RabbitmqModule],
  providers: [
    ActionExecutorService,
    InventoryActionService,
    BusinessActionService,
    OperationActionService,
    GeneralActionService,
  ],
  exports: [ActionExecutorService],
})
export class ActionsModule {}
