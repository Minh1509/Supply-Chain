import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

export class PurchaseOrderRequestDto {
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  companyId?: number;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  supplierCompanyId?: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  quotationId?: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  receiveWarehouseId?: number;

  @ApiProperty({ example: 'BANK_TRANSFER', required: false })
  @IsOptional()
  paymentMethod?: string;

  @ApiProperty({ example: '123 Street', required: false })
  @IsOptional()
  deliveryToAddress?: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsOptional()
  createdBy?: string;

  @ApiProperty({ example: 'PENDING', required: false })
  @IsOptional()
  status?: string;
}
