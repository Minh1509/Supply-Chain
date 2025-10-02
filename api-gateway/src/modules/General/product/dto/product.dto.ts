import { ApiProperty } from '@nestjs/swagger';

export class ProductDto {
  @ApiProperty({
    description: 'ID của sản phẩm',
    example: 1,
  })
  productId: number;

  @ApiProperty({
    description: 'ID của item',
    example: 1,
  })
  itemId: number;

  @ApiProperty({
    description: 'Tên của item',
    example: 'Máy tính xách tay Dell',
  })
  itemName: string;

  @ApiProperty({
    description: 'Thông số kỹ thuật',
    example: 'Intel Core i7, 16GB RAM, 512GB SSD',
  })
  technicalSpecifications: string;

  @ApiProperty({
    description: 'Company ID hiện tại',
    example: 1,
  })
  currentCompanyId: number;

  @ApiProperty({
    description: 'Số serial của sản phẩm',
    example: 'SN123456789',
  })
  serialNumber: string;

  @ApiProperty({
    description: 'Batch number',
    example: 12345,
  })
  batchNo: number;

  @ApiProperty({
    description: 'QR Code của sản phẩm',
    example: 'QR123456789',
  })
  qrCode: string;
}