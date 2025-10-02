import { ApiProperty } from '@nestjs/swagger';

export class UploadResponseDto {
  @ApiProperty({ example: 'https://cdn.example.com/company-logos/uuid-file.jpg' })
  url: string;
}
