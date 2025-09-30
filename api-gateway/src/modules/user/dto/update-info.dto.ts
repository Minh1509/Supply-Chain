import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { Role } from 'src/common/enums';
import { UserStatus } from 'src/common/enums/user.enum';

export class UpdateInfoDto {
  @ApiPropertyOptional({
    description: 'Role của user',
    enum: Role,
    example: Role.C_ADMIN,
  })
  @IsEnum(Role)
  @IsOptional()
  role?: string;

  @ApiPropertyOptional({
    description: 'Username mới',
    example: 'new_username',
  })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiPropertyOptional({
    description: 'Email mới',
    example: 'newuser@example.com',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'Trạng thái của user',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
  })
  @IsEnum(UserStatus)
  @IsOptional()
  status?: string;
}
