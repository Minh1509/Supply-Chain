import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

export class VerifyOTPDto {
  @ApiProperty({ example: 'minh@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 123456 })
  @IsNumber()
  @IsNotEmpty()
  @Min(100000)
  @Max(999999)
  otp: number;
}
