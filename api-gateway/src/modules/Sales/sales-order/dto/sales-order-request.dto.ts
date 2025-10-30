import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class SalesOrderRequestDto {
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  companyId?: number;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  customerCompanyId?: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  poId?: number;

  @ApiProperty({ example: 'BANK_TRANSFER', required: false })
  @IsOptional()
  paymentMethod?: string;

  @ApiProperty({ example: '123 Warehouse St, District 1, HCMC', required: false })
  @IsOptional()
  deliveryFromAddress?: string;

  @ApiProperty({ example: '456 Customer St, District 2, HCMC', required: false })
  @IsOptional()
  deliveryToAddress?: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsOptional()
  createdBy?: string;

  @ApiProperty({ example: 'PENDING', required: false })
  @IsOptional()
  status?: string;
}
