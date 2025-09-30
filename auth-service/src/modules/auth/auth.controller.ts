import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { plainToInstance } from 'class-transformer';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { AUTH_CONSTANTS } from './auth.constants';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @MessagePattern(AUTH_CONSTANTS.REGISTER_COMPANY)
  async registerCompany(@Payload() data: any) {
    this.logger.debug('AuthController.registerCompany', { data });
    return this.authService.registerCompany(data);
  }

  @MessagePattern(AUTH_CONSTANTS.LOGIN)
  async login(@Payload() data: any) {
    this.logger.debug('AuthController.login', { data });
    return await this.authService.login(data);
  }

  @MessagePattern(AUTH_CONSTANTS.LOGOUT)
  async logout(@Payload() payload: { userId: number; jti: string }) {
    this.logger.debug('AuthController.logout', { payload });
    return await this.authService.logout(payload.userId, payload.jti);
  }

  @MessagePattern(AUTH_CONSTANTS.REFRESH_TOKEN)
  async refreshToken(@Payload() data: any) {
    this.logger.debug('AuthController.refreshToken', { data });
    return await this.authService.refreshToken(data);
  }

  @MessagePattern(AUTH_CONSTANTS.VERIFY_OTP)
  async verifyOtp(@Payload() data: any) {
    this.logger.debug('AuthController.verifyOtp', { data });
    return await this.authService.verifyOtp(data);
  }

  @MessagePattern(AUTH_CONSTANTS.FORGOT_PASSWORD)
  async forgotPassword(@Payload() data: any) {
    this.logger.debug('AuthController.forgotPassword', { data });
    return await this.authService.forgotPassword(data);
  }

  @MessagePattern(AUTH_CONSTANTS.RESET_PASSWORD)
  async resetPassword(@Payload() data: any) {
    this.logger.debug('AuthController.resetPassword', { data });
    return await this.authService.resetPassword(data);
  }

  @MessagePattern(AUTH_CONSTANTS.SYSADMIN_LOGIN)
  async sysadminLogin(@Payload() data: any) {
    this.logger.debug('AuthController.sysadminLogin', { data });
    return await this.authService.sysadminLogin(data);
  }

  @MessagePattern(AUTH_CONSTANTS.SYSADMIN_VERIFY_OTP)
  async sysadminVerifyOtp(@Payload() data: any) {
    this.logger.debug('AuthController.sysadminVerifyOtp', { data });
    return await this.authService.sysadminVerifyOtp(data);
  }

  @MessagePattern(AUTH_CONSTANTS.VERIFY_TOKEN)
  async verifyToken(@Payload() data: any) {
    this.logger.debug('AuthController.verifyToken', { data });
    return await this.authService.verifyToken(data.token);
  }
}
