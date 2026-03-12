import { AgentCard } from '@a2a-js/sdk';
import { APP_NAME, BASE_URL } from '../config';

export const agentCard: AgentCard = {
  name: APP_NAME,
  description: 'A specialized Las Vegas expert concierge.',
  protocolVersion: '0.3.0',
  version: '1.0.0',
  url: `${BASE_URL}/a2a/jsonrpc`,
  capabilities: {
    pushNotifications: false,
  },
  defaultInputModes: ['text'],
  defaultOutputModes: ['text'],
  skills: [
    {
      id: 'chat',
      name: 'Chat',
      description: 'Interact with the Las Vegas concierge',
      tags: ['chat']
    }
  ],
  additionalInterfaces: [
    { url: `${BASE_URL}/a2a/jsonrpc`, transport: 'JSONRPC' },
    { url: `${BASE_URL}/a2a/rest`, transport: 'HTTP+JSON' },
  ],
};
