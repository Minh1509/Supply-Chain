import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class ManuProcessRequestDto {
  @ApiProperty({ description: 'Manufacture order id', example: 123 })
  @IsNotEmpty()
  @IsNumber()
  moId: number;

  @ApiProperty({ description: 'Stage detail id', example: 10 })
  @IsOptional()
  @IsNumber()
  stageDetailId?: number;

  @ApiProperty({ description: 'Start time (ISO8601)', example: '2025-10-27T08:00:00' })
  @IsOptional()
  @IsISO8601()
  startedOn?: string;

  @ApiProperty({ description: 'Finish time (ISO8601)', example: '2025-10-27T12:00:00' })
  @IsOptional()
  @IsISO8601()
  finishedOn?: string;

  @ApiProperty({ description: 'Status', example: 'IN_PROGRESS' })
  @IsOptional()
  @IsString()
  status?: string;
}
