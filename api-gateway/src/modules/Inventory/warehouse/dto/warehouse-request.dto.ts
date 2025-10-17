import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class WarehouseRequestDto {
  @ApiProperty({
    description: 'Tên kho',
    example: 'Kho trung tâm Hà Nội',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  warehouseName: string;

  @ApiProperty({
    description: 'Mô tả kho',
    example: 'Kho lưu trữ hàng hóa chính tại Hà Nội',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Sức chứa tối đa',
    example: 10000,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  maxCapacity: number;

  @ApiProperty({
    description: 'Loại kho',
    example: 'Kho thành phẩm',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  warehouseType: string;

  @ApiProperty({
    description: 'Trạng thái kho',
    example: 'ACTIVE',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  status: string;
}
