import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RegisterCompanyDto {
  @ApiProperty({ example: 'Công ty ABC' })
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @ApiProperty({ example: '0123456789' })
  @IsString()
  @IsNotEmpty()
  taxCode: string;

  @ApiProperty({ example: '123 Đường ABC, Quận 1' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ example: 'Vietnam' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({ example: 'doanh nghiệp sản xuất' })
  @IsString()
  @IsNotEmpty()
  companyType: string;

  @ApiProperty({ example: 'Công nghiệp chế biến' })
  @IsString()
  @IsOptional()
  mainIndustry: string;

  @ApiProperty({ example: 'Nguyễn Văn A' })
  @IsString()
  @IsNotEmpty()
  representativeName: string;

  @ApiProperty({ example: '2025-09-26' })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  startDate: Date;

  @ApiProperty({ example: '0901234567' })
  @IsString()
  @IsOptional()
  phoneNumber: string;

  @ApiProperty({ example: 'minh@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'https://example.com' })
  @IsString()
  @IsOptional()
  websiteAddress: string;

  @ApiProperty({ example: 'E001' })
  @IsString()
  @IsNotEmpty()
  employeeCode: string;

  @ApiProperty({ example: 'Quản lý' })
  @IsString()
  @IsOptional()
  position: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
