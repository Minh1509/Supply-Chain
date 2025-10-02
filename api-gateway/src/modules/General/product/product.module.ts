import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { RabbitmqModule } from '../../rabbitmq/rabbitmq.module';

@Module({
  imports: [RabbitmqModule],
  controllers: [ProductController],
})
export class ProductModule {}