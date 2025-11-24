import { Module } from '@nestjs/common';
// Update the import path if the file is located elsewhere, for example:
import { ItemController } from './item.controller';
import { RabbitmqModule } from '../../rabbitmq/rabbitmq.module';
import { S3Service } from 'src/common/services/s3.service';

@Module({
  imports: [RabbitmqModule],
  controllers: [ItemController],
  providers: [S3Service],
})
export class ItemModule {}