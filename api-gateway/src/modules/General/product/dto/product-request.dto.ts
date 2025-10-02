import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class ProductRequestDto {
  // @ApiProperty({
  //   description: 'Company ID hiện tại',
  //   example: 1,
  //   required: true,
  // })
  // @IsNotEmpty()
  // @IsNumber()
  // currentCompanyId: number;

  @ApiProperty({
    description: 'Batch number',
    example: 121212,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  batchNo?: number;

  @ApiProperty({
    description: 'QR Code của sản phẩm',
    example: 'QR123456789',
    required: false,
  })
  @IsOptional()
  @IsString()
  qrCode?: string;
}