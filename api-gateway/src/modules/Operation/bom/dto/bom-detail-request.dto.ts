import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class BOMDetailRequestDto {
  @ApiProperty({ description: 'Item id of material', example: 456 })
  @IsNotEmpty()
  @IsNumber()
  itemId: number;

  @ApiProperty({ description: 'Quantity required', example: 2.5 })
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({ description: 'Note', example: 'Use grade A material', required: false })
  @IsOptional()
  @IsString()
  note?: string;
}
