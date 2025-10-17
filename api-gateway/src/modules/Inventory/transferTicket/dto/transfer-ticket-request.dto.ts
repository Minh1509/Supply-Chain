import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested, IsArray } from 'class-validator';
import { TransferTicketDetailRequestDto } from './transfer-ticket-detail-request.dto';

export class TransferTicketRequestDto {
  @ApiProperty({
    description: 'ID của công ty',
    example: 1,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  companyId: number;

  @ApiProperty({
    description: 'ID của kho xuất',
    example: 1,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  fromWarehouseId: number;

  @ApiProperty({
    description: 'ID của kho nhập',
    example: 2,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  toWarehouseId: number;

  @ApiProperty({
    description: 'Lý do chuyển kho',
    example: 'Cân bằng tồn kho giữa các chi nhánh',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  reason: string;

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
    description: 'Chi tiết phiếu chuyển kho',
    type: [TransferTicketDetailRequestDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TransferTicketDetailRequestDto)
  transferTicketDetails?: TransferTicketDetailRequestDto[];
}
