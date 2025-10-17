import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString, ValidateNested, IsArray } from 'class-validator';
import { ReceiveTicketDetailRequestDto } from './receive-ticket-detail-request.dto';

export class ReceiveTicketRequestDto {
  @ApiProperty({
    description: 'ID của công ty',
    example: 1,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  companyId: number;

  @ApiProperty({
    description: 'ID của kho',
    example: 1,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  warehouseId: number;

  @ApiProperty({
    description: 'Ngày nhập kho',
    example: '2025-10-16T10:00:00',
    required: true,
  })
  @IsNotEmpty()
  @IsDateString()
  receiveDate: string;

  @ApiProperty({
    description: 'Lý do nhập kho',
    example: 'Nhập hàng từ nhà cung cấp',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  reason: string;

  @ApiProperty({
    description: 'Loại phiếu nhập (mo/po/tt)',
    example: 'po',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  receiveType: string;

  @ApiProperty({
    description: 'Mã tham chiếu',
    example: 'PO001',
    required: false,
  })
  @IsOptional()
  @IsString()
  referenceCode?: string;

  @ApiProperty({
    description: 'Người tạo',
    example: 'John Doe',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  createdBy: string;

  @ApiProperty({
    description: 'Trạng thái',
    example: 'PENDING',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  status: string;

  @ApiProperty({
    description: 'File đính kèm',
    example: 'file.pdf',
    required: false,
  })
  @IsOptional()
  @IsString()
  file?: string;

  @ApiProperty({
    description: 'Ghi chú',
    example: 'Ghi chú cho phiếu nhập',
    required: false,
  })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({
    description: 'Chi tiết phiếu nhập',
    type: [ReceiveTicketDetailRequestDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReceiveTicketDetailRequestDto)
  receiveTicketDetails?: ReceiveTicketDetailRequestDto[];
}
