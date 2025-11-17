import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OpenAIService } from './openai.service';
import { LocalAIService } from './localai.service';
import { PromptService } from './prompt.service';

@Module({
  imports: [ConfigModule],
  providers: [OpenAIService, LocalAIService, PromptService],
  exports: [LocalAIService, PromptService], 
})
export class LLMModule {}
