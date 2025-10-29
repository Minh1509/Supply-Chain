import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class DeliveryOrderRequestDto {
  @ApiProperty({ description: 'Sales order id', example: 123 })
  @IsNotEmpty()
  @IsNumber()
  soId: number;

  @ApiProperty({ description: 'Status', example: 'PENDING' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ description: 'Created by', example: 'admin' })
  @IsOptional()
  @IsString()
  createdBy?: string;
}