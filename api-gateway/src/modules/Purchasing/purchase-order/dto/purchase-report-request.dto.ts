import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, IsString } from 'class-validator';

export class PurchaseReportRequestDto {
  @ApiProperty({
    description: 'Start date',
    example: '2025-01-01',
    type: String,
    required: false,
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  startDate?: Date;

  @ApiProperty({
    description: 'End date',
    example: '2025-12-31',
    type: String,
    required: false,
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  endDate?: Date;
}
