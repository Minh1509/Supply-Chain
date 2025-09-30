import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  Length,
} from 'class-validator';
import { CompanyStatus } from 'src/common/enums/company.enum';

export class CompanyDto {
  @ApiPropertyOptional({ example: 'C001', description: 'Mã công ty' })
  @IsString()
  @IsOptional()
  companyCode?: string;

  @ApiPropertyOptional({ example: '0101234567', description: 'Mã số thuế' })
  @IsString()
  @IsOptional()
  taxCode?: string;

  @ApiPropertyOptional({ example: 'Công ty ABC', description: 'Tên công ty' })
  @IsString()
  @IsOptional()
  companyName?: string;

  @ApiPropertyOptional({ example: '123 Nguyễn Trãi, Hà Nội', description: 'Địa chỉ' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 'Vietnam', description: 'Quốc gia' })
  @IsString()
  @IsOptional()
  country?: string;

  @ApiPropertyOptional({ example: 'TNHH', description: 'Loại hình doanh nghiệp' })
  @IsString()
  @IsOptional()
  companyType?: string;

  @ApiPropertyOptional({
    example: 'Công nghệ thông tin',
    description: 'Ngành nghề chính',
  })
  @IsString()
  @IsOptional()
  mainIndustry?: string;

  @ApiPropertyOptional({
    example: 'Nguyễn Văn A',
    description: 'Người đại diện pháp luật',
  })
  @IsString()
  @IsOptional()
  representativeName?: string;

  @ApiPropertyOptional({ example: '2020-01-01', description: 'Ngày thành lập' })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  startDate?: Date;

  @ApiPropertyOptional({ example: '0912345678', description: 'Số điện thoại' })
  @IsString()
  @Length(9, 15)
  @IsOptional()
  phoneNumber?: string;

  @ApiPropertyOptional({ example: 'contact@example.com', description: 'Email liên hệ' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'https://abc.com', description: 'Website công ty' })
  @IsUrl()
  @IsOptional()
  websiteAddress?: string;

  @ApiPropertyOptional({
    example: 'https://cdn.abc.com/logo.png',
    description: 'URL logo công ty',
  })
  @IsUrl()
  @IsOptional()
  logoUrl?: string;

  @ApiPropertyOptional({
    example: CompanyStatus.ACTIVE,
    enum: CompanyStatus,
    description: 'Trạng thái công ty',
  })
  @IsEnum(CompanyStatus)
  @IsOptional()
  status?: string;
}
