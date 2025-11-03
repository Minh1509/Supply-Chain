import { registerAs } from '@nestjs/config';

export const getSessionConfig = () => ({
  expirySeconds: +process.env.SESSION_EXPIRY_SECONDS || 3600,
  maxConversationHistory: +process.env.MAX_CONVERSATION_HISTORY || 10,
});

export default registerAs('session', getSessionConfig);
