import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OpenAIService } from './openai.service';
import { PromptService } from './prompt.service';

@Module({
  imports: [ConfigModule],
  providers: [OpenAIService, PromptService],
  exports: [OpenAIService, PromptService],
})
export class LLMModule {}
