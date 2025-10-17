import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class IssueReportRequestDto {
  @ApiProperty({
    description: 'Thời gian bắt đầu',
    example: '2025-01-01T00:00:00',
    required: true,
  })
  @IsNotEmpty()
  @IsDateString()
  startTime: string;

  @ApiProperty({
    description: 'Thời gian kết thúc',
    example: '2025-12-31T23:59:59',
    required: true,
  })
  @IsNotEmpty()
  @IsDateString()
  endTime: string;

  @ApiProperty({
    description: 'Loại phiếu xuất (so/mo/tt)',
    example: 'so',
    required: false,
  })
  @IsOptional()
  @IsString()
  issueType?: string;

  @ApiProperty({
    description: 'ID của kho',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  warehouseId?: number;
}
