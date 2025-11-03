import { Injectable } from '@nestjs/common';
import { SYSTEM_PROMPTS } from 'src/common/constants';

@Injectable()
export class PromptService {
  getSystemPrompt(userContext?: any): string {
    let prompt = SYSTEM_PROMPTS.MAIN;

    if (userContext?.companyId) {
      prompt += `\n\nUser's company ID: ${userContext.companyId}`;
    }

    if (userContext?.role) {
      prompt += `\nUser's role: ${userContext.role}`;
    }

    return prompt;
  }

  getIntentRecognitionPrompt(): string {
    return SYSTEM_PROMPTS.INTENT_RECOGNITION;
  }

  buildContextualPrompt(
    currentMessage: string,
    conversationHistory: any[],
    additionalContext?: string,
  ): string {
    let prompt = 'Previous conversation:\n';

    for (const msg of conversationHistory.slice(-5)) {
      prompt += `${msg.role}: ${msg.content}\n`;
    }

    if (additionalContext) {
      prompt += `\nAdditional context: ${additionalContext}\n`;
    }

    prompt += `\nCurrent message: ${currentMessage}\n`;
    prompt += '\nProvide a helpful response:';

    return prompt;
  }

  formatInventoryQuery(itemId: number, warehouseId?: number): string {
    if (warehouseId) {
      return `Check inventory for item ${itemId} in warehouse ${warehouseId}`;
    }
    return `Check inventory for item ${itemId} in all warehouses`;
  }

  formatOrderQuery(orderType: string, orderId: string): string {
    return `Get ${orderType} with ID/Code: ${orderId}`;
  }

  buildConfirmationPrompt(action: string, details: any): string {
    return `You are about to perform: ${action}\n\nDetails:\n${JSON.stringify(details, null, 2)}\n\nDo you want to proceed? (yes/no)`;
  }

  formatSuccessMessage(action: string, result: any): string {
    return `Successfully completed: ${action}\n\nResult: ${JSON.stringify(result, null, 2)}`;
  }

  formatErrorMessage(error: string): string {
    return `Error: ${error}`;
  }
}
