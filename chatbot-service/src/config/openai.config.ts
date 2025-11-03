import { registerAs } from '@nestjs/config';

export const getOpenAIConfig = () => ({
  apiKey: process.env.OPENAI_API_KEY,
  model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  maxTokens: +process.env.OPENAI_MAX_TOKENS || 4096,
  temperature: +process.env.OPENAI_TEMPERATURE || 0.7,
});

export default registerAs('openai', getOpenAIConfig);
