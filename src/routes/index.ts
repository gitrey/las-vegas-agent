import { Router, Request, Response } from 'express';
import { AGENT_CARD_PATH } from '@a2a-js/sdk';
import { DefaultRequestHandler, InMemoryTaskStore } from '@a2a-js/sdk/server';
import { agentCardHandler, jsonRpcHandler, restHandler, UserBuilder } from '@a2a-js/sdk/server/express';
import { agentCard } from '../agent/card';
import { AdkExecutor } from '../agent/executor';
import { conciergeService } from '../services/concierge';

export const router = Router();

// Set up the A2A request handler
const requestHandler = new DefaultRequestHandler(
  agentCard,
  new InMemoryTaskStore(),
  new AdkExecutor()
);

// Mount A2A routes
router.use(`/${AGENT_CARD_PATH}`, agentCardHandler({ agentCardProvider: requestHandler }));
router.use('/a2a/jsonrpc', jsonRpcHandler({ requestHandler, userBuilder: UserBuilder.noAuthentication }));
router.use('/a2a/rest', restHandler({ requestHandler, userBuilder: UserBuilder.noAuthentication }));

// Keep the old chat endpoint for backwards compatibility
router.post('/chat', async (req: Request, res: Response): Promise<void> => {
    try {
        const { message, sessionId = 'default-session', userId = 'default-user' } = req.body;

        if (!message) {
            res.status(400).json({ error: 'Message is required in the request body.' });
            return;
        }

        const finalText = await conciergeService.processMessage(userId, sessionId, message);

        res.json({
            response: finalText
        });
    } catch (error) {
        console.error('Error handling chat request:', error);
        res.status(500).json({ error: 'An error occurred while processing the request.' });
    }
});

router.get('/health', (req, res) => {
    res.send('OK');
});

router.get('/', (req, res) => {
    res.send('Las Vegas Agent running. A2A Agent Card is available at /.well-known/agent-card.json');
});
