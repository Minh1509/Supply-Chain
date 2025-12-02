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
    description: 'Mã item',
    example: 'ITEM-001',
  })
  itemCode: string;

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
    description: 'Tên công ty hiện tại',
    example: 'Công ty ABC',
  })
  currentCompanyName: string;

  @ApiProperty({
    description: 'Số serial của sản phẩm',
    example: 'SN123456',
  })
  serialNumber: string;

  @ApiProperty({
    description: 'Batch number',
    example: 'BATCH-MO-001',
  })
  batchNo: string;

  @ApiProperty({
    description: 'QR Code của sản phẩm',
    example: 'PRODUCT-1-ABC12345',
  })
  qrCode: string;

  @ApiProperty({
    description: 'Trạng thái sản phẩm',
    example: 'Đã sản xuất',
  })
  status: string;

  @ApiProperty({
    description: 'Ngày sản xuất',
    example: '2024-12-02T10:30:00',
  })
  manufacturedDate: Date;

  @ApiProperty({
    description: 'ID công ty sản xuất',
    example: 1,
  })
  manufacturerCompanyId: number;

  @ApiProperty({
    description: 'Tên công ty sản xuất',
    example: 'Công ty ABC',
  })
  manufacturerCompanyName: string;
}