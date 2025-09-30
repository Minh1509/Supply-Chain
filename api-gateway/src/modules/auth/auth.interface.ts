import { JwtTokenType, Role } from 'src/common/enums';

export interface JwtPayload {
  sub: number;
  username: string;
  email: string;
  jti: string;
  roles: Role[];
}

export interface UserRequestPayload {
  sub: number;
  username: string;
  email: string;
  jti: string;
  roles: Role[];
  typeToken: JwtTokenType;
}
