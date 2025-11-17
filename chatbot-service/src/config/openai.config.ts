import { registerAs } from '@nestjs/config';

export const getOpenAIConfig = () => ({
  baseUrl: process.env.LOCALAI_BASE_URL || 'http://localhost:8080/v1',
  apiKey: process.env.OPENAI_API_KEY || 'not-needed',
  model: process.env.OPENAI_MODEL || 'guanaco-7B',
  maxTokens: +process.env.OPENAI_MAX_TOKENS || 4096,
  temperature: +process.env.OPENAI_TEMPERATURE || 0.7,
});

export default registerAs('openai', getOpenAIConfig);
