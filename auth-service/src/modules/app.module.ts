import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WinstonModule } from 'nest-winston';
import { getWinstonConfig } from 'src/common/utilities/log.util';
import {
  appConfiguration,
  databaseConfiguration,
  rabbitmqConfiguration,
  redisConfiguration,
} from 'src/config';
import { AllRpcExceptionsFilter } from 'src/exceptions/all-rpc-exception.filter';
import { AuthModule } from './auth/auth.module';
import { RabbitmqModule } from './shared/rabbitmq/rabbitmq.module';
import { RedisModule } from './shared/redis/redis.module';
import { UserModule } from './user/user.module';
import { validationSchema } from '../config/config.validation';
import { AdminModule } from './admin/admin.module';
import { EmployeeModule } from './employee/employee.module';
import { CompanyModule } from './company/company.module';
import { DepartmentModule } from './department/department.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
      load: [
        appConfiguration,
        databaseConfiguration,
        redisConfiguration,
        rabbitmqConfiguration,
      ],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (databaseConfig: ConfigType<typeof databaseConfiguration>) => {
        return databaseConfig;
      },
      inject: [databaseConfiguration.KEY],
    }),
    WinstonModule.forRootAsync({
      useFactory: (appConfig: ConfigType<typeof appConfiguration>) => {
        return getWinstonConfig(appConfig.appName);
      },
      inject: [appConfiguration.KEY],
    }),
    AuthModule,
    UserModule,
    RedisModule,
    RabbitmqModule,
    AdminModule,
    EmployeeModule,
    CompanyModule,
    DepartmentModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllRpcExceptionsFilter,
    },
  ],
  exports: [],
})
export class AppModule {}
