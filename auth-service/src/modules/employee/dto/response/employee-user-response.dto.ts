import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

export class EmployeeUserResponseDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  departmentId: number;

  @ApiProperty()
  @Expose()
  departmentName: string;

  @ApiProperty()
  @Expose()
  employeeCode: string;

  @ApiProperty()
  @Expose()
  employeeName: string;

  @ApiProperty()
  @Expose()
  position: string;

  @ApiProperty()
  @Expose()
  gender: string;

  @ApiProperty()
  @Expose()
  address: string;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty()
  @Expose()
  phoneNumber: string;

  @ApiProperty()
  @Expose()
  dateOfBirth: Date;

  @ApiProperty()
  @Expose()
  avatar: string;

  @ApiProperty()
  @Expose()
  status: string;
}
