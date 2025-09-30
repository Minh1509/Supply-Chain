import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Role } from 'src/common/enums';
import { UserStatus } from 'src/common/enums/user.enum';

export class UserDto {
  @ApiPropertyOptional({ description: 'Employee ID', example: 101 })
  @IsOptional()
  @IsNotEmpty()
  employeeId?: number;

  @ApiProperty({ description: 'Username', example: 'john_doe' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'Email của user', example: 'john.doe@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Role của user',
    enum: Role,
    example: Role.C_ADMIN,
  })
  @IsEnum(Role)
  role: string;

  @ApiProperty({
    description: 'Trạng thái của user',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
  })
  @IsEnum(UserStatus)
  status: string;

  @ApiProperty({ description: 'Password', minLength: 6, example: 'StrongPass123!' })
  @IsString()
  @MinLength(6)
  password: string;
}
