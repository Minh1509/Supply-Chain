import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class ManufactureLineRequestDto {

  @ApiProperty({
    description: 'Tên dây chuyền sản xuất',
    example: 'Dây chuyền sản xuất số 1',
    required: false,
  })
  @IsOptional()
  @IsString()
  lineName?: string;

  @ApiProperty({
    description: 'Công suất dây chuyền',
    example: 1000.5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  capacity?: number;

  @ApiProperty({
    description: 'Mô tả dây chuyền',
    example: 'Dây chuyền sản xuất tự động',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}