import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonalizationService } from './personalization.service';
import { UserPreferenceEntity } from './entities/user-preference.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserPreferenceEntity])],
  providers: [PersonalizationService],
  exports: [PersonalizationService],
})
export class PersonalizationModule {}
