import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class TransferTicketDetailRequestDto {
  @ApiProperty({
    description: 'ID của item',
    example: 1,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  itemId: number;

  @ApiProperty({
    description: 'Số lượng chuyển kho',
    example: 50,
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @ApiProperty({
    description: 'Ghi chú',
    example: 'Chuyển hàng sang kho chi nhánh',
    required: false,
  })
  @IsOptional()
  @IsString()
  note?: string;
}
