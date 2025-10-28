import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class RfqDetailRequestDto {
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  itemId?: number;

  @ApiProperty({ example: 101, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  supplierItemId?: number;

  @ApiProperty({ example: 100, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  quantity?: number;

  @ApiProperty({ example: 'Need urgent delivery', required: false })
  @IsOptional()
  note?: string;
}
