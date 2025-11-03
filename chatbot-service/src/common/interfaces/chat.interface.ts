export interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ConversationContext {
  sessionId: string;
  userId: number;
  companyId?: number;
  messages: ConversationMessage[];
  lastIntent?: string;
  currentState?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface IntentResult {
  intent: string;
  confidence: number;
  entities: Record<string, any>;
}

export interface ActionRequest {
  type: string;
  params: Record<string, any>;
  userId: number;
  companyId?: number;
}

export interface ActionResult {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}
