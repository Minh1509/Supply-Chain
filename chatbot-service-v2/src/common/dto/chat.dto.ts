import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ChatRequestDto {
  @ApiProperty({ example: 'Tồn kho sản phẩm ABC là bao nhiêu?' })
  @IsString()
  message: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  conversationId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  userRole?: string;
}

export class ChatResponseDto {
  conversationId: string;
  message: string;
  intent?: string;
  entities?: Record<string, any>;
  actions?: any[];
  timestamp: Date;
}
