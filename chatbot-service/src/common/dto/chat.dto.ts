import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class ChatMessageDto {
  @IsNotEmpty()
  @IsString()
  message: string;

  @IsNotEmpty()
  @IsString()
  sessionId: string;

  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @IsOptional()
  @IsNumber()
  companyId?: number;

  @IsOptional()
  metadata?: Record<string, any>;
}

export class ChatResponseDto {
  message: string;
  intent?: string;
  suggestions?: string[];
  data?: any;
  timestamp: Date;
}

export class ConversationHistoryDto {
  @IsNotEmpty()
  @IsString()
  sessionId: string;

  @IsOptional()
  @IsNumber()
  limit?: number;
}
