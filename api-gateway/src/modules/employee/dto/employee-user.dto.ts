import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { Role } from 'src/common/enums';
import { EmployeeStatus, Gender } from 'src/common/enums/employee.enum';

export class EmployeeUserDto {
  @ApiProperty({ example: 'EMP001', description: 'Mã nhân viên', required: false })
  @IsString()
  @IsOptional()
  employeeCode?: string;

  @ApiProperty({ example: 'Nguyễn Văn A', description: 'Tên nhân viên', required: false })
  @IsString()
  @IsOptional()
  employeeName?: string;

  @ApiProperty({ example: 'Software Engineer', description: 'Chức vụ', required: false })
  @IsString()
  @IsOptional()
  position?: string;

  @ApiProperty({
    example: Gender.MALE,
    enum: Gender,
    description: 'Giới tính',
    required: false,
  })
  @IsEnum(Gender)
  @IsOptional()
  gender?: string;

  @ApiProperty({
    example: '123 Nguyễn Trãi, Hà Nội',
    description: 'Địa chỉ',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({
    example: 'nva@example.com',
    description: 'Email nhân viên',
    required: false,
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: '0912345678', description: 'Số điện thoại', required: false })
  @IsString()
  @Length(9, 15)
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({ example: '1995-09-15', description: 'Ngày sinh', required: false })
  @IsDateString()
  @IsOptional()
  dateOfBirth?: Date;

  @ApiProperty({
    example: '2022-01-01',
    description: 'Ngày bắt đầu làm việc',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  startDate?: Date;

  @ApiProperty({
    example: EmployeeStatus.ACTIVE,
    enum: EmployeeStatus,
    description: 'Trạng thái nhân viên',
    required: false,
  })
  @IsEnum(EmployeeStatus)
  @IsOptional()
  status?: string;

  @ApiProperty({ example: 1, description: 'ID phòng ban', required: false })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  departmentId?: number;

  @ApiProperty({
    example: 'nva',
    description: 'Tên tài khoản đăng nhập',
    required: false,
  })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({ example: 'StrongPass123!', description: 'Mật khẩu', required: false })
  @IsString()
  @Length(6, 32)
  @IsOptional()
  password?: string;

  @ApiProperty({
    example: Role.USER,
    enum: Role,
    description: 'Vai trò của nhân viên',
    required: false,
  })
  @IsEnum(Role)
  @IsOptional()
  role?: string;
}
