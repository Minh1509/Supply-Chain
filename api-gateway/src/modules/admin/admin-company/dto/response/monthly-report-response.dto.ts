import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class MonthlyCompanyReportResponseDto {
  @Expose()
  @ApiProperty()
  month: string;

  @ApiProperty()
  @Expose()
  totalQuantity: number;
}
