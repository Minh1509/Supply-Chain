import { ApiProperty } from '@nestjs/swagger';

export class MonthlyUserReportResponseDto {
  @ApiProperty()
  month: string;

  @ApiProperty()
  totalQuantity: number;
}
