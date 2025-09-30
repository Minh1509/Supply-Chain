import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { Role } from 'src/common/enums';
import { EmployeeStatus, Gender } from 'src/common/enums/employee.enum';

export class EmployeeDto {
  @ApiProperty({ example: 'EMP001', description: 'Mã nhân viên' })
  @IsString()
  @IsNotEmpty()
  employeeCode: string;

  @ApiProperty({ example: 'Nguyễn Văn A', description: 'Tên nhân viên' })
  @IsString()
  @IsNotEmpty()
  employeeName: string;

  @ApiProperty({ example: 'Software Engineer', description: 'Chức vụ' })
  @IsString()
  @IsNotEmpty()
  position: string;

  @ApiProperty({ example: Gender.MALE, enum: Gender, description: 'Giới tính' })
  @IsEnum(Gender)
  gender: string;

  @ApiProperty({ example: '123 Nguyễn Trãi, Hà Nội', description: 'Địa chỉ' })
  @IsString()
  @IsOptional()
  address: string;

  @ApiProperty({ example: 'nva@example.com', description: 'Email nhân viên' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '0912345678', description: 'Số điện thoại' })
  @IsString()
  @Length(9, 15)
  phoneNumber: string;

  @ApiProperty({ example: '1995-09-15', description: 'Ngày sinh' })
  @IsDateString()
  dateOfBirth: Date;

  @ApiProperty({ example: '2022-01-01', description: 'Ngày bắt đầu làm việc' })
  @IsDateString()
  startDate: Date;

  @ApiProperty({
    example: EmployeeStatus.ACTIVE,
    enum: EmployeeStatus,
    description: 'Trạng thái nhân viên',
  })
  @IsEnum(EmployeeStatus)
  status: string;

  @ApiProperty({ example: 1, description: 'ID phòng ban' })
  @IsNumber()
  @Type(() => Number)
  departmentId: number;

  @ApiProperty({ example: 'nva', description: 'Tên tài khoản đăng nhập' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'StrongPass123!', description: 'Mật khẩu' })
  @IsString()
  @Length(6, 32)
  password: string;

  @ApiProperty({ example: Role.USER, enum: Role, description: 'Vai trò của nhân viên' })
  @IsEnum(Role)
  @IsNotEmpty()
  role: string;
}
