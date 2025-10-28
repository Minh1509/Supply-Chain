import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { RfqDetailRequestDto } from './rfq-detail-request.dto';

export class RequestForQuotationRequestDto {
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  companyId?: number;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  requestedCompanyId?: number;

  @ApiProperty({
    description: 'End date',
    example: '2025-12-31',
    type: String,
    required: false,
  })
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  needByDate?: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsOptional()
  createdBy?: string;

  @ApiProperty({ example: 'Chưa báo giá', required: false })
  @IsOptional()
  status?: string;

  @ApiProperty({ type: [RfqDetailRequestDto], required: false })
  @ValidateNested({ each: true })
  @Type(() => RfqDetailRequestDto)
  @IsOptional()
  rfqDetails?: RfqDetailRequestDto[];
}
