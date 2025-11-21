import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ManuStageDetailRequestDto {
  @ApiProperty({ description: 'Stage name', example: 'Cắt vật liệu' })
  @IsNotEmpty()
  @IsString()
  stageName: string;

  @ApiProperty({ description: 'Stage order', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  stageOrder: number;

  @ApiProperty({ description: 'Estimated time in minutes', example: 120 })
  @IsNotEmpty()
  @IsNumber()
  estimatedTime: number;

  @ApiProperty({ description: 'Description', example: 'Cắt vật liệu theo kích thước' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class ManuStageRequestDto {
  @ApiProperty({ description: 'Item id', example: 123 })
  @IsNotEmpty()
  @IsNumber()
  itemId: number;

  @ApiProperty({ description: 'Description', example: 'Quy trình sản xuất sản phẩm A' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Status', example: 'ACTIVE' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ 
    description: 'List of stage details', 
    type: [ManuStageDetailRequestDto] 
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ManuStageDetailRequestDto)
  stageDetails: ManuStageDetailRequestDto[];
}

export class ManuStageUpdateData {
  @ApiProperty({ description: 'Description', example: 'Quy trình sản xuất sản phẩm A' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Status', example: 'Ngừng sử dụng' })
  @IsOptional()
  @IsString()
  status?: string;
}