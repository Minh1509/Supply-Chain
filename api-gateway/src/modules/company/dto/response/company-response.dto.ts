import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CompanyUserResponseDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  companyCode: string;

  @ApiProperty()
  @Expose()
  taxCode: string;

  @ApiProperty()
  @Expose()
  companyName: string;

  @ApiProperty()
  @Expose()
  address: string;

  @ApiProperty()
  @Expose()
  country: string;

  @ApiProperty()
  @Expose()
  companyType: string;

  @ApiProperty()
  @Expose()
  mainIndustry: string;

  @ApiProperty()
  @Expose()
  representativeName: string;

  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  startDate: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  @Expose()
  joinDate: Date;

  @ApiProperty()
  @Expose()
  phoneNumber: string;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty()
  @Expose()
  websiteAddress: string;

  @ApiProperty()
  @Expose()
  logo: string;

  @ApiProperty()
  @Expose()
  logoUrl: string;

  @ApiProperty()
  @Expose()
  status: string;
}
