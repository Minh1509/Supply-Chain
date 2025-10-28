import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateStatusRequestDto {
  @ApiProperty({ example: 'COMPLETED', required: false })
  @IsOptional()
  status?: string;
}
