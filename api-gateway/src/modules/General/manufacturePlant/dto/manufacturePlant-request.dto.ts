import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ManuPlantRequestDto {

  @ApiProperty({ description: 'Tên nhà máy', example: 'Nhà máy A' })
  @IsOptional()
  @IsString()
  plantName?: string;

  @ApiProperty({ description: 'Mô tả', example: 'Nhà máy sản xuất chính' })
  @IsOptional()
  @IsString()
  description?: string;
}