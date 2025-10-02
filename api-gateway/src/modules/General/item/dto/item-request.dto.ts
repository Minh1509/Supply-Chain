import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class ItemRequestDto {
  @ApiProperty({
    description: 'Item code',
    example: 'LT001',
    required: false
  })
  @IsString()
  @IsOptional()
  itemCode?: string;

  @ApiProperty({
    description: 'Item name',
    example: 'Laptop Dell XPS 13'
  })
  @IsString()
  @IsNotEmpty()
  itemName: string;

  @ApiProperty({
    description: 'Item type',
    example: 'Electronics',
    required: false
  })
  @IsString()
  @IsOptional()
  itemType?: string;

  @ApiProperty({
    description: 'Is item sellable',
    example: true,
    required: false
  })
  @IsBoolean()
  @IsOptional()
  isSellable?: boolean;

  @ApiProperty({
    description: 'Unit of measure',
    example: 'pcs',
    required: false
  })
  @IsString()
  @IsOptional()
  uom?: string;

  @ApiProperty({
    description: 'Technical specifications',
    example: 'Intel Core i7, 16GB RAM, 512GB SSD',
    required: false
  })
  @IsString()
  @IsOptional()
  technicalSpecifications?: string;

  @ApiProperty({
    description: 'Import price',
    example: 20000000,
    required: false
  })
  @IsNumber()
  @IsOptional()
  importPrice?: number;

  @ApiProperty({
    description: 'Export price',
    example: 25000000,
    required: false
  })
  @IsNumber()
  @IsOptional()
  exportPrice?: number;

  @ApiProperty({
    description: 'Item description',
    example: 'High-performance laptop for development',
    required: false
  })
  @IsString()
  @IsOptional()
  description?: string;
}
