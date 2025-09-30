import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { EmployeeResponseDto } from 'src/modules/admin/admin-employee/dto/response/employee-response.dto';

export class UserResponseDto {
  @Expose() userId: number;
  @Expose() employeeId?: number;
  @Expose()
  @Transform(({ obj }) => obj.employee?.employeeCode, { toClassOnly: true })
  employeeCode?: string;

  @Expose() username: string;
  @Expose() email: string;
  @Expose() role: string;
  @Expose() status: string;
  @Expose() createdAt: Date;
  @Expose() updatedAt: Date;
}
