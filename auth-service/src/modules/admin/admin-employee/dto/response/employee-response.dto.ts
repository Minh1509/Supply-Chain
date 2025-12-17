import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class EmployeeResponseDto {
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

  @ApiProperty()
  @Expose()
  @Type(() => Date)
  startDate: Date;
}
