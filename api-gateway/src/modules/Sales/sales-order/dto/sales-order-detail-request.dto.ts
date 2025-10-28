import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class SalesOrderDetailRequestDto {
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  itemId?: number;

  @ApiProperty({ example: 101, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  customerItemId?: number;

  @ApiProperty({ example: 5000, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  discount?: number;

  @ApiProperty({ example: 100, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  quantity?: number;

  @ApiProperty({ example: 50000, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  itemPrice?: number;

  @ApiProperty({ example: 'Special delivery instructions', required: false })
  @IsOptional()
  note?: string;
}
