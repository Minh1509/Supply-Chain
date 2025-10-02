import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { WinstonModule } from 'nest-winston';
import { AllExceptionsFilter } from 'src/exceptions';
import { JwtAuthGuard } from 'src/guards';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { CompanyModule } from './company/company.module';
import { DepartmentModule } from './department/department.module';
import { EmployeeModule } from './employee/employee.module';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';
import { UserModule } from './user/user.module';
import { getWinstonConfig } from '../common/utilities';
import { appConfiguration, rabbitmqConfiguration } from '../config';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfiguration, rabbitmqConfiguration],
    }),
    WinstonModule.forRootAsync({
      useFactory: (appConfig: ConfigType<typeof appConfiguration>) => {
        return getWinstonConfig(appConfig.appName);
      },
      inject: [appConfiguration.KEY],
    }),
    MulterModule.register({
      storage: memoryStorage(),
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
