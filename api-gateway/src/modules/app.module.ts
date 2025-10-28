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
import { ItemModule } from './General/item/item.module';
import { ManufactureLineModule } from './General/manufactureLine/manufactureLine.module';
import { ManufacturePlantModule } from './General/manufacturePlant/manufacturePlant.module';
import { ProductModule } from './General/product/product.module';
import { InventoryModule } from './Inventory/inventory/inventory.module';
import { IssueTicketModule } from './Inventory/issueTicket/issue-ticket.module';
import { ReceiveTicketModule } from './Inventory/receiveTicket/receive-ticket.module';
import { TransferTicketModule } from './Inventory/transferTicket/transfer-ticket.module';
import { WarehouseModule } from './Inventory/warehouse/warehouse.module';
import { PurchaseOrderModule } from './Purchasing/purchase-order/purchase-order.module';
import { RequestForQuotationModule } from './Purchasing/request-for-quotation/request-for-quotation.module';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';
import { InvoiceModule } from './Sales/invoice/invoice.module';
import { QuotationModule } from './Sales/quotation/quotation.module';
import { SalesOrderModule } from './Sales/sales-order/sales-order.module';
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
    ItemModule,
    ProductModule,
    ManufacturePlantModule,
    ManufactureLineModule,
    InventoryModule,
    ReceiveTicketModule,
    IssueTicketModule,
    TransferTicketModule,
    WarehouseModule,
    PurchaseOrderModule,
    RequestForQuotationModule,
    InvoiceModule,
    QuotationModule,
    SalesOrderModule,
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
