import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { codeExpiresConfiguration, jwtConfiguration } from 'src/config';
import { Company, Department, Employee, User } from 'src/entities';
import { AuthPublisherService } from './auth-publisher.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RabbitmqModule } from '../shared/rabbitmq/rabbitmq.module';
import { RedisModule } from '../shared/redis/redis.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Company, Employee, Department]),
    ConfigModule.forRoot({ load: [jwtConfiguration, codeExpiresConfiguration] }),
    JwtModule.registerAsync({
      imports: [ConfigModule.forFeature(jwtConfiguration)],
      useFactory: (jwtConfig: ConfigType<typeof jwtConfiguration>) => ({
        global: true,
        secret: jwtConfig.secret,
        signOptions: {
          algorithm: jwtConfig.algorithm,
        },
      }),
      inject: [jwtConfiguration.KEY],
    }),
    RedisModule,
    RabbitmqModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthPublisherService],
  exports: [AuthService, AuthPublisherService],
})
export class AuthModule {}
