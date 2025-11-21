import { Injectable } from '@nestjs/common';
import { ConversationService } from './conversation.service';

interface ContextData {
  lastIntent?: string;
  lastEntities?: Record<string, any>;
  currentTopic?: string;
  pendingAction?: string;
  userPreferences?: Record<string, any>;
  recentItems?: string[];
  recentWarehouses?: string[];
}

@Injectable()
export class ConversationContextService {
  constructor(private readonly conversationService: ConversationService) {}

  async getContext(conversationId: string): Promise<ContextData> {
    const conversation = await this.conversationService.getConversation(conversationId);
    return conversation?.context || {};
  }

  async updateContext(conversationId: string, updates: Partial<ContextData>): Promise<void> {
    const currentContext = await this.getContext(conversationId);
    const newContext = { ...currentContext, ...updates };
    await this.conversationService.updateConversationContext(conversationId, newContext);
  }

  async addToRecentItems(conversationId: string, itemId: string): Promise<void> {
    const context = await this.getContext(conversationId);
    const recentItems = context.recentItems || [];

    if (!recentItems.includes(itemId)) {
      recentItems.unshift(itemId);
      if (recentItems.length > 5) recentItems.pop();

      await this.updateContext(conversationId, { recentItems });
    }
  }

  async addToRecentWarehouses(conversationId: string, warehouseId: string): Promise<void> {
    const context = await this.getContext(conversationId);
    const recentWarehouses = context.recentWarehouses || [];

    if (!recentWarehouses.includes(warehouseId)) {
      recentWarehouses.unshift(warehouseId);
      if (recentWarehouses.length > 3) recentWarehouses.pop();

      await this.updateContext(conversationId, { recentWarehouses });
    }
  }

  async setCurrentTopic(conversationId: string, topic: string): Promise<void> {
    await this.updateContext(conversationId, { currentTopic: topic });
  }

  async setPendingAction(conversationId: string, action: string): Promise<void> {
    await this.updateContext(conversationId, { pendingAction: action });
  }

  async clearPendingAction(conversationId: string): Promise<void> {
    await this.updateContext(conversationId, { pendingAction: null });
  }

  async inferMissingEntities(
    conversationId: string,
    currentEntities: Record<string, any>,
  ): Promise<Record<string, any>> {
    const context = await this.getContext(conversationId);
    const enriched = { ...currentEntities };

    if (!enriched.itemId && context.recentItems?.length > 0) {
      enriched.itemId = context.recentItems[0];
      enriched._inferred = enriched._inferred || [];
      enriched._inferred.push('itemId');
    }

    if (!enriched.warehouseId && context.recentWarehouses?.length > 0) {
      enriched.warehouseId = context.recentWarehouses[0];
      enriched._inferred = enriched._inferred || [];
      enriched._inferred.push('warehouseId');
    }

    if (!enriched.companyId && context.userPreferences?.defaultCompanyId) {
      enriched.companyId = context.userPreferences.defaultCompanyId;
    }

    return enriched;
  }
}
