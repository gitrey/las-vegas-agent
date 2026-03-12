export const PORT = process.env.PORT || 8080;
export const APP_NAME = 'las-vegas-agent';
// Cloud Run injects K_SERVICE, but we can also use a fallback for local testing
export const BASE_URL = process.env.SERVICE_URL || `https://las-vegas-agent-74002798414.us-central1.run.app`;
