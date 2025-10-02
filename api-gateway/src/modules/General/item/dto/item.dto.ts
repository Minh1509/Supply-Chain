import { ApiProperty } from '@nestjs/swagger';

export class ItemDto {
  @ApiProperty({
    description: 'Item ID',
    example: 1,
  })
  itemId: number;

  @ApiProperty({
    description: 'Company ID that owns this item',
    example: 1,
  })
  companyId: number;

  @ApiProperty({
    description: 'Item code',
    example: 'LT001',
  })
  itemCode: string;

  @ApiProperty({
    description: 'Item name',
    example: 'Laptop Dell XPS 13',
  })
  itemName: string;

  @ApiProperty({
    description: 'Item type',
    example: 'Electronics',
  })
  itemType: string;

  @ApiProperty({
    description: 'Is item sellable',
    example: true,
  })
  isSellable: boolean;

  @ApiProperty({
    description: 'Unit of measure',
    example: 'pcs',
  })
  uom: string;

  @ApiProperty({
    description: 'Technical specifications',
    example: 'Intel Core i7, 16GB RAM, 512GB SSD',
  })
  technicalSpecifications: string;

  @ApiProperty({
    description: 'Import price',
    example: 20000000,
  })
  importPrice: number;

  @ApiProperty({
    description: 'Export price',
    example: 25000000,
  })
  exportPrice: number;

  @ApiProperty({
    description: 'Item description',
    example: 'High-performance laptop for development',
  })
  description: string;
}