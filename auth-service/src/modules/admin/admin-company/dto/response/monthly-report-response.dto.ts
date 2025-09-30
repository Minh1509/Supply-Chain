import { Expose } from 'class-transformer';

export class MonthlyCompanyReportResponseDto {
  @Expose()
  month: string;

  @Expose()
  totalQuantity: number;
}
