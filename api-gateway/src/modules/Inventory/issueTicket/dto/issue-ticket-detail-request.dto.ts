import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class IssueTicketDetailRequestDto {
  @ApiProperty({
    description: 'ID của item',
    example: 1,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  itemId: number;

  @ApiProperty({
    description: 'Số lượng xuất',
    example: 50,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @ApiProperty({
    description: 'Ghi chú',
    example: 'Xuất hàng cho đơn hàng SO001',
    required: false,
  })
  @IsOptional()
  @IsString()
  note?: string;
}
