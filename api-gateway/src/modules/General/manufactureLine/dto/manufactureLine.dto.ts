import { ApiProperty } from '@nestjs/swagger';

export class ManufactureLineDto {
  @ApiProperty({
    description: 'ID của dây chuyền sản xuất',
    example: 1,
  })
  lineId: number;

  @ApiProperty({
    description: 'ID của công ty',
    example: 1,
  })
  companyId: number;

  @ApiProperty({
    description: 'ID của nhà máy',
    example: 1,
  })
  plantId: number;

  @ApiProperty({
    description: 'Tên nhà máy',
    example: 'Nhà máy sản xuất ABC',
  })
  plantName: string;

  @ApiProperty({
    description: 'Mã dây chuyền sản xuất',
    example: 'LINE001',
  })
  lineCode: string;

  @ApiProperty({
    description: 'Tên dây chuyền sản xuất',
    example: 'Dây chuyền sản xuất số 1',
  })
  lineName: string;

  @ApiProperty({
    description: 'Công suất dây chuyền',
    example: 1000.5,
  })
  capacity: number;

  @ApiProperty({
    description: 'Mô tả dây chuyền',
    example: 'Dây chuyền sản xuất tự động',
  })
  description: string;
}