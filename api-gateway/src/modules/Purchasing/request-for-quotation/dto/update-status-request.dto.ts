import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateStatusRequestDto {
  @ApiProperty({ example: 'Đã báo giá', required: false })
  @IsOptional()
  status?: string;
}
