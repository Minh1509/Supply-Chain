import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

export class UserResponseDto {
  @ApiProperty()
  @Expose()
  userId: number;

  @ApiProperty()
  @Expose()
  employeeId?: number;

  @ApiProperty()
  @Expose()
  @Transform(({ obj }) => obj.employee?.employeeCode, { toClassOnly: true })
  employeeCode?: string;

  @ApiProperty()
  @Expose()
  username: string;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty()
  @Expose()
  role: string;

  @ApiProperty()
  @Expose()
  status: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}
