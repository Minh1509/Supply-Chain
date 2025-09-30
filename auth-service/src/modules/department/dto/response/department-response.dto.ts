import { Expose } from 'class-transformer';

export class DepartmentResponseDto {
  @Expose()
  companyId?: number;

  @Expose()
  id?: number;

  @Expose()
  departmentCode?: string;

  @Expose()
  departmentName?: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
