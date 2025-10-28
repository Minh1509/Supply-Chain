import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class MonthlyReportRequestDto {
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  companyId?: number;

  @ApiProperty({ example: 'COMPLETED', required: false })
  @IsOptional()
  status?: string;

  @ApiProperty({ example: 2025, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  year?: number;
}
