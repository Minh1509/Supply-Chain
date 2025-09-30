import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class DepartmentResponseDto {
  @ApiProperty()
  @Expose()
  companyId?: number;

  @ApiProperty()
  @Expose()
  id?: number;

  @ApiProperty()
  @Expose()
  departmentCode?: string;

  @ApiProperty()
  @Expose()
  departmentName?: string;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}
