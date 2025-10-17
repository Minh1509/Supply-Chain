import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsDateString, ValidateNested, IsArray } from 'class-validator';
import { IssueTicketDetailRequestDto } from './issue-ticket-detail-request.dto';

export class IssueTicketRequestDto {
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
    description: 'Ngày xuất kho',
    example: '2025-10-16T10:00:00',
    required: true,
  })
  @IsNotEmpty()
  @IsDateString()
  issueDate: string;

  @ApiProperty({
    description: 'Lý do xuất kho',
    example: 'Xuất hàng cho đơn hàng',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  reason: string;

  @ApiProperty({
    description: 'Loại phiếu xuất (so/mo/tt)',
    example: 'so',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  issueType: string;

  @ApiProperty({
    description: 'Mã tham chiếu',
    example: 'SO001',
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
    example: 'Ghi chú cho phiếu xuất',
    required: false,
  })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({
    description: 'Chi tiết phiếu xuất',
    type: [IssueTicketDetailRequestDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IssueTicketDetailRequestDto)
  issueTicketDetails?: IssueTicketDetailRequestDto[];
}
