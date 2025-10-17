import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class InventoryRequestDto {
  @ApiProperty({
    description: 'ID của kho',
    example: 1,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  warehouseId: number;

  @ApiProperty({
    description: 'ID của item',
    example: 1,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  itemId: number;

  @ApiProperty({
    description: 'Số lượng tồn kho',
    example: 100,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiProperty({
    description: 'Số lượng đang được yêu cầu',
    example: 50,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  onDemandQuantity?: number;
}
