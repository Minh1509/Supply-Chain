import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { QuotationDetailRequestDto } from './quotation-detail-request.dto';

export class QuotationRequestDto {
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  companyId?: number;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  requestCompanyId?: number;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  rfqId?: number;

  @ApiProperty({ example: 5000000, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  subTotal?: number;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  taxRate?: number;

  @ApiProperty({ example: 500000, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  taxAmount?: number;

  @ApiProperty({ example: 5500000, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  totalAmount?: number;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsOptional()
  createdBy?: string;

  @ApiProperty({ example: 'Đã tạo', required: false })
  @IsOptional()
  status?: string;

  @ApiProperty({ type: [QuotationDetailRequestDto], required: false })
  @ValidateNested({ each: true })
  @Type(() => QuotationDetailRequestDto)
  @IsOptional()
  quotationDetails?: QuotationDetailRequestDto[];
}
