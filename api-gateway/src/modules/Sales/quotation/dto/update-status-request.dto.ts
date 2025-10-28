import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateStatusRequestDto {
  @ApiProperty({ example: 'Đã chấp nhận', required: false })
  @IsOptional()
  status?: string;
}
