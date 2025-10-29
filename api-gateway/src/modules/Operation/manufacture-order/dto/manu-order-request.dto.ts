import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsISO8601 } from 'class-validator';

export class ManuOrderRequestDto {
  @ApiProperty({ description: 'Item id', example: 123 })
  @IsNotEmpty()
  @IsNumber()
  itemId: number;

  @ApiProperty({ description: 'Manufacture line id', example: 10 })
  @IsOptional()
  @IsNumber()
  lineId?: number;

  @ApiProperty({ description: 'Type', example: 'PRODUCTION' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({ description: 'Quantity', example: 100.5 })
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({ description: 'Estimated start time (ISO8601)', example: '2025-10-27T08:00:00' })
  @IsOptional()
  @IsISO8601()
  estimatedStartTime?: string;

  @ApiProperty({ description: 'Estimated end time (ISO8601)', example: '2025-10-27T16:00:00' })
  @IsOptional()
  @IsISO8601()
  estimatedEndTime?: string;

  @ApiProperty({ description: 'Created by', example: 'system' })
  @IsOptional()
  @IsString()
  createdBy?: string;

  @ApiProperty({ description: 'Status', example: 'PENDING' })
  @IsOptional()
  @IsString()
  status?: string;
}

export class ManuReportRequestDto {
  @ApiProperty({ description: 'Start date (ISO8601)', example: '2025-10-01' })
  @IsOptional()
  @IsISO8601()
  startDate?: string;

  @ApiProperty({ description: 'End date (ISO8601)', example: '2025-10-31' })
  @IsOptional()
  @IsISO8601()
  endDate?: string;

  @ApiProperty({ description: 'Optional filter by itemId', example: 123, required: false })
  @IsOptional()
  @IsNumber()
  itemId?: number;
}
