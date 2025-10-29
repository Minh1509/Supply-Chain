import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class DeliveryProcessRequestDto {
  @ApiProperty({ description: 'Delivery order id', example: 123 })
  @IsNotEmpty()
  @IsNumber()
  doId: number;

  @ApiProperty({ description: 'Location', example: 'Kho hàng Hà Nội' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ description: 'Arrival time (ISO8601)', example: '2025-10-28T14:30:00' })
  @IsOptional()
  @IsISO8601()
  arrivalTime?: string;

  @ApiProperty({ description: 'Note', example: 'Hàng đã được giao thành công' })
  @IsOptional()
  @IsString()
  note?: string;
}