import { LlmAgent, GOOGLE_SEARCH, Runner, InMemorySessionService, isFinalResponse } from '@google/adk';
import { APP_NAME } from '../config';
import { systemInstruction } from '../prompt';

export class ConciergeService {
    private agent: LlmAgent;
    private sessionService: InMemorySessionService;
    private runner: Runner;

    constructor() {
        this.agent = new LlmAgent({
            name: 'las_vegas_concierge',
            model: 'gemini-3.1-flash-lite-preview', 
            description: 'A specialized Las Vegas expert concierge.',
            instruction: systemInstruction,
            tools: [GOOGLE_SEARCH],
        });

        this.sessionService = new InMemorySessionService();

        this.runner = new Runner({
            appName: APP_NAME,
            agent: this.agent,
            sessionService: this.sessionService,
        });
    }

    async processMessage(userId: string, sessionId: string, messageText: string): Promise<string> {
        const session = await this.sessionService.getSession({
            appName: APP_NAME,
            userId,
            sessionId,
        });

        if (!session) {
            await this.sessionService.createSession({
                appName: APP_NAME,
                userId,
                sessionId,
            });
        }

        const eventGenerator = this.runner.runAsync({
            userId,
            sessionId,
            newMessage: { role: 'user', parts: [{ text: messageText }] },
        });

        let finalText = '';
        for await (const event of eventGenerator) {
            console.log('Received event:', JSON.stringify(event));
            if (isFinalResponse(event)) {
                const parts = event.content?.parts || [];
                finalText = parts.map(p => p.text || '').join('');
            }
        }

        return finalText || 'I apologize, but I could not generate a response.';
    }
}

// Export a singleton instance for use across the application
export const conciergeService = new ConciergeService();
