import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class PurchaseOrderDetailRequestDto {
  @ApiProperty({
    description: 'Item ID',
    example: 1,
    required: false,
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  itemId?: number;

  @ApiProperty({
    description: 'Supplier Item ID',
    example: 101,
    required: false,
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  supplierItemId?: number;

  @ApiProperty({
    description: 'Discount amount',
    example: 5000,
    required: false,
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  discount?: number;

  @ApiProperty({
    description: 'Quantity',
    example: 100,
    required: false,
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  quantity?: number;

  @ApiProperty({
    description: 'Item price',
    example: 50000,
    required: false,
  })
  @IsNumber()
  @Type(() => Number)
  @IsOptional()
  itemPrice?: number;

  @ApiProperty({
    description: 'Note',
    example: 'Special instructions',
    required: false,
  })
  @IsString()
  @IsOptional()
  note?: string;
}
