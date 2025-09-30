import { Expose } from 'class-transformer';

export class CompanyResponseDto {
  @Expose()
  id: number;

  @Expose()
  companyCode: string;

  @Expose()
  taxCode: string;

  @Expose()
  companyName: string;

  @Expose()
  address: string;

  @Expose()
  country: string;

  @Expose()
  companyType: string;

  @Expose()
  mainIndustry: string;

  @Expose()
  representativeName: string;

  @Expose()
  startDate: Date;

  @Expose()
  joinDate: Date;

  @Expose()
  phoneNumber: string;

  @Expose()
  email: string;

  @Expose()
  websiteAddress: string;

  @Expose()
  logoUrl: string;

  @Expose()
  status: string;
}
