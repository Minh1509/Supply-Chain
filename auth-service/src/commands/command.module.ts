import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import dataSourceOptions from 'ormconfig';
import { User } from 'src/entities/user.entity';
import { CreateAdminCommand } from './create-admin.command';
import { CreateAdminQuestions } from './questions/create-admin.question';

@Module({
  imports: [TypeOrmModule.forRoot(dataSourceOptions), TypeOrmModule.forFeature([User])],
  providers: [CreateAdminQuestions, CreateAdminCommand],
  exports: [],
})
export class CommandModule {}
