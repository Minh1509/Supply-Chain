import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import { AllExceptionsFilter } from 'src/exceptions';
import { JwtAuthGuard } from 'src/guards';
import { AuthModule } from './auth/auth.module';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';
import { UserModule } from './user/user.module';
import { getWinstonConfig } from '../common/utilities';
import { appConfiguration, rabbitmqConfiguration } from '../config';
import { EmployeeModule } from './employee/employee.module';
import { DepartmentModule } from './department/department.module';
import { CompanyModule } from './company/company.module';
import { AdminModule } from './admin/admin.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfiguration, rabbitmqConfiguration],
    }),
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 100,
    }),
    WinstonModule.forRootAsync({
      useFactory: (appConfig: ConfigType<typeof appConfiguration>) => {
        return getWinstonConfig(appConfig.appName);
      },
      inject: [appConfiguration.KEY],
    }),
    AuthModule,
    UserModule,
    RabbitmqModule,
    EmployeeModule,
    DepartmentModule,
    CompanyModule,
    AdminModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
