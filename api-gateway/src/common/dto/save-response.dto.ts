import { ApiProperty } from '@nestjs/swagger';

export class SaveResponseDto {
  @ApiProperty()
  id: number;
}
