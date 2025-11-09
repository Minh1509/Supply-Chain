import { Module } from '@nestjs/common';
import { EntityExtractionService } from './entity-extraction.service';

@Module({
  providers: [EntityExtractionService],
  exports: [EntityExtractionService],
})
export class EntityExtractionModule {}

