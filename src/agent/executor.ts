import { Message } from '@a2a-js/sdk';
import { AgentExecutor, RequestContext, ExecutionEventBus } from '@a2a-js/sdk/server';
import { v4 as uuidv4 } from 'uuid';
import { conciergeService } from '../services/concierge';

export class AdkExecutor implements AgentExecutor {
  async execute(requestContext: RequestContext, eventBus: ExecutionEventBus): Promise<void> {
    const { userMessage, contextId } = requestContext;
    const userId = 'default-user'; // Temporarily hardcoded as RequestContext doesn't have userId
    
    // Extract the text from the A2A userMessage
    const textPart = userMessage?.parts?.find(p => p.kind === 'text');
    const messageText = textPart && 'text' in textPart ? textPart.text : '';

    if (!messageText) {
       eventBus.finished();
       return;
    }

    try {
        const sessionId = contextId || 'default-session';
        const finalText = await conciergeService.processMessage(userId, sessionId, messageText);

        const responseMessage: Message = {
          kind: 'message',
          messageId: uuidv4(),
          role: 'agent',
          parts: [{ kind: 'text', text: finalText }],
          contextId: contextId,
        };

        eventBus.publish(responseMessage);
    } catch (error) {
        console.error('Error in agent execution:', error);
        const errorMessage: Message = {
            kind: 'message',
            messageId: uuidv4(),
            role: 'agent',
            parts: [{ kind: 'text', text: 'An error occurred while processing the request.' }],
            contextId: contextId,
        };
        eventBus.publish(errorMessage);
    } finally {
        eventBus.finished();
    }
  }

  cancelTask = async (): Promise<void> => {};
}
