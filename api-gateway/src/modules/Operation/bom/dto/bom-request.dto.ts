import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { BOMDetailRequestDto } from './bom-detail-request.dto';

export class BOMRequestDto {
  @ApiProperty({ description: 'Item id for which BOM is created', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  itemId: number;

  @ApiProperty({ description: 'Description of BOM', example: 'BOM for product X', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Status', example: 'ACTIVE', required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ type: [BOMDetailRequestDto], description: 'List of BOM details' })
  @IsOptional()
  bomDetails?: BOMDetailRequestDto[];
}
