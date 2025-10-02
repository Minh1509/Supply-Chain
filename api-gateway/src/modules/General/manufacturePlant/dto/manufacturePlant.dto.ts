import { ApiProperty } from '@nestjs/swagger';

export class ManufacturePlantDto {
  @ApiProperty({ description: 'ID nhà máy', example: 1 })
  plantId: number;

  @ApiProperty({ description: 'ID công ty', example: 1 })
  companyId: number;

  @ApiProperty({ description: 'Mã nhà máy', example: 'PLANT01' })
  plantCode: string;

  @ApiProperty({ description: 'Tên nhà máy', example: 'Nhà máy A' })
  plantName: string;

  @ApiProperty({ description: 'Mô tả', example: 'Nhà máy sản xuất chính' })
  description: string;
}