import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-custom';
import { ExtractJwt } from 'passport-jwt';
import { firstValueFrom } from 'rxjs';
import { RABBITMQ_CONSTANTS } from 'src/common/constants/rabbitmq.constant';
import { AUTH_CONSTANTS } from '../auth.constant';

@Injectable()
export class AuthStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject(RABBITMQ_CONSTANTS.AUTH.name) private readonly clientAuth: ClientProxy,
  ) {
    super();
  }

  async validate(req: Request) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

    if (!token) {
      throw new UnauthorizedException('Token not found');
    }
    try {
      const userPayload = await firstValueFrom(
        this.clientAuth.send(AUTH_CONSTANTS.VERIFY_TOKEN, { token }),
      );

      if (!userPayload) {
        throw new UnauthorizedException('user payload not found');
      }

      return userPayload;
    } catch (error) {
      throw new UnauthorizedException('Token verification failed');
    }
  }
}
