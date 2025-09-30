import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @ApiProperty({
    description: 'Password hiện tại',
    example: 'oldPass123',
  })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({
    description: 'Password mới',
    minLength: 6,
    example: 'newPass456',
  })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
