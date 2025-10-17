import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class ReceiveTicketDetailRequestDto {
  @ApiProperty({
    description: 'ID của item',
    example: 1,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  itemId: number;

  @ApiProperty({
    description: 'Số lượng',
    example: 100,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @ApiProperty({
    description: 'Ghi chú',
    example: 'Hàng nhập từ nhà cung cấp A',
    required: false,
  })
  @IsOptional()
  @IsString()
  note?: string;
}
