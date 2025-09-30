// auth.controller.ts
import { Body, Controller, HttpStatus, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { RABBITMQ_CONSTANTS } from 'src/common/constants/rabbitmq.constant';
import { SuccessResponseDto } from 'src/common/dto';
import { Public, SwaggerApiDocument, User } from 'src/decorators';
import { AUTH_CONSTANTS } from './auth.constant';
import { UserRequestPayload } from './auth.interface';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterCompanyDto } from './dto/register-company.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LoginResponseDto } from './dto/response/login-response.dto';
import { VerifyOTPDto } from './dto/verify-otp.dto';

@Controller('auth')
export class AuthController {
  constructor(@Inject(RABBITMQ_CONSTANTS.AUTH.name) private authClient: ClientProxy) {}

  @SwaggerApiDocument({
    operation: {
      summary: `register Company`,
      operationId: `registerCompany`,
    },
    response: {
      status: HttpStatus.OK,
      type: SuccessResponseDto,
    },
  })
  @Public()
  @Post('register')
  async register(@Body() body: RegisterCompanyDto) {
    return await firstValueFrom(
      this.authClient.send(AUTH_CONSTANTS.REGISTER_COMPANY, body),
    );
  }

  @SwaggerApiDocument({
    operation: {
      summary: `login`,
      operationId: `login`,
    },
    response: {
      status: HttpStatus.OK,
      type: LoginResponseDto,
    },
  })
  @Public()
  @Post('login')
  async login(@Body() body: LoginDto) {
    return await firstValueFrom(this.authClient.send(AUTH_CONSTANTS.LOGIN, body));
  }

  @SwaggerApiDocument({
    operation: {
      summary: `logout`,
      operationId: `logout`,
    },
    response: {
      status: HttpStatus.OK,
      type: SuccessResponseDto,
    },
  })
  @ApiBearerAuth()
  @Post('logout')
  async logout(@User() user: UserRequestPayload) {
    const { sub: userId, jti } = user;

    return await firstValueFrom(
      this.authClient.send(AUTH_CONSTANTS.LOGOUT, { userId, jti }),
    );
  }

  @ApiBearerAuth()
  @Post('refresh-token')
  async refreshToken(@Body() body: RefreshTokenDto) {
    return await firstValueFrom(this.authClient.send(AUTH_CONSTANTS.REFRESH_TOKEN, body));
  }

  @SwaggerApiDocument({
    operation: {
      summary: `verify otp`,
      operationId: `verify otp`,
    },
    response: {
      status: HttpStatus.OK,
      type: SuccessResponseDto,
    },
  })
  @Public()
  @Post('verify-otp')
  async verifyOtp(@Body() body: VerifyOTPDto) {
    return await firstValueFrom(this.authClient.send(AUTH_CONSTANTS.VERIFY_OTP, body));
  }

  @SwaggerApiDocument({
    operation: {
      summary: `forgot password`,
      operationId: `forgot password`,
    },
    response: {
      status: HttpStatus.OK,
      type: SuccessResponseDto,
    },
  })
  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return await firstValueFrom(
      this.authClient.send(AUTH_CONSTANTS.FORGOT_PASSWORD, body),
    );
  }

  @SwaggerApiDocument({
    operation: {
      summary: `reset password`,
      operationId: `reset password`,
    },
    response: {
      status: HttpStatus.OK,
      type: SuccessResponseDto,
    },
  })
  @Public()
  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    return await firstValueFrom(
      this.authClient.send(AUTH_CONSTANTS.RESET_PASSWORD, body),
    );
  }

  @Public()
  @Post('sysadmin-login')
  async sysadminLogin(@Body() body: LoginDto) {
    return await firstValueFrom(
      this.authClient.send(AUTH_CONSTANTS.SYSADMIN_LOGIN, body),
    );
  }

  @SwaggerApiDocument({
    operation: {
      summary: `system-admin verify otp`,
      operationId: `system-admin verify otp`,
    },
    response: {
      status: HttpStatus.OK,
      type: LoginResponseDto,
    },
  })
  @Public()
  @Post('sysadmin-verify-otp')
  async sysadminVerifyOtp(@Body() body: VerifyOTPDto) {
    return await firstValueFrom(
      this.authClient.send(AUTH_CONSTANTS.SYSADMIN_VERIFY_OTP, body),
    );
  }
}
