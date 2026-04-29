# Las Vegas Concierge Agent

A specialized AI agent acting as a Las Vegas expert concierge, powered by Gemini
3.1 Flash and the Google Agent Development Kit (ADK). This agent is designed to
assist users with information about hotels, entertainment, restaurants, and
walking times on the Las Vegas Strip, with specific expertise in the Mandalay
Bay complex.

It also implements the Agent-to-Agent (A2A) protocol, allowing it to interact
with other agents.

## Features

- **Specialized Knowledge**: Deep understanding of Mandalay Bay, Delano, Four
  Seasons, Luxor, Excalibur, and Allegiant Stadium connections.
- **Real-time Search**: Uses Google Search for up-to-date information and
  accurate walking times between other properties.
- **A2A Protocol Compliant**: Exposes standard endpoints for Agent-to-Agent
  communication.
- **Legacy Chat Support**: Maintains a simple chat endpoint for direct
  interaction.

## Tech Stack

- **Runtime**: Node.js (v20 recommended)
- **Language**: TypeScript
- **Framework**: Express
- **AI SDK**: `@google/adk` (Agent Development Kit)
- **Protocol SDK**: `@a2a-js/sdk` (Agent-to-Agent SDK)
- **Model**: `gemini-3.1-flash-lite-preview`

## Getting Started

### Prerequisites

- Node.js (v20 or higher)
- npm
- Access to Google Cloud / Gemini API

### Installation

1. Clone the repository (if not already done).
2. Install dependencies:
   ```bash
   npm install
   ```

### Configuration

The application can be configured via environment variables:

- `PORT`: The port the server will listen on (default: `8080`).
- `SERVICE_URL`: The base URL of the service, used for generating A2A endpoint
  URLs in the agent card.

See `src/config.ts` for details.

### Running Locally

To start the agent in development mode with auto-reload:

```bash
npm run dev
```

To build and run in production mode:

```bash
npm run build
npm run start
```

## API Endpoints

### Agent-to-Agent (A2A)

- **`/.well-known/agent-card.json`**: Returns the A2A Agent Card describing the
  agent's capabilities and skills.
- **`/a2a/jsonrpc`**: JSON-RPC endpoint for A2A communication.
- **`/a2a/rest`**: REST endpoint for A2A communication.

### General

- **`/chat`**: Legacy chat endpoint. Expects a JSON body:
  ```json
  {
    "message": "How long does it take to walk from Mandalay Bay to Luxor?",
    "sessionId": "optional-session-id",
    "userId": "optional-user-id"
  }
  ```
- **`/health`**: Returns `OK` to indicate the service is running.
- **`/`**: Basic landing page indicating the agent is running.

## Cloud Run Deployment

You can deploy this agent to Google Cloud Run. The easiest way is to use the
Google Cloud SDK (`gcloud`).

### Prerequisites

1. Install the [Google Cloud SDK](https://cloud.google.com/sdk/docs/install).
2. Initialize the SDK and set your project:
   ```bash
   gcloud init
   ```
3. Ensure the Artifact Registry and Cloud Run APIs are enabled in your project.

### Deployment Steps

To build the image and deploy the service in one step:

```bash
gcloud run deploy las-vegas-agent \
  --source . \
  --region us-central1 \
  --no-allow-unauthenticated
```

This command will build the container image using Cloud Build and deploy it to
Cloud Run.

### Post-Deployment Configuration

After the initial deployment, you need to set the `SERVICE_URL` environment
variable to the generated Cloud Run URL. You can do this dynamically using
`gcloud`:

```bash
SERVICE_URL=$(gcloud run services describe las-vegas-agent --region us-central1 --format 'value(status.url)')
```

This ensures the A2A Agent Card returns the correct URLs.

### Secret Manager Setup (Recommended)

To securely store the `GEMINI_API_KEY` without exposing it in plain text, use
Google Cloud Secret Manager.

1. **Enable the Secret Manager API**:

   ```bash
   gcloud services enable secretmanager.googleapis.com
   ```

2. **Create a secret and add the API key**:

   ```bash
   echo -n $GEMINI_API_KEY | gcloud secrets create gemini-api-key --data-file=-
   ```

3. **Grant access to the Cloud Run service account**:

   Get your project number:

   ```bash
   PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)")
   ```

   Grant the `Secret Manager Secret Accessor` role to the default compute
   service account:

   ```bash
   gcloud secrets add-iam-policy-binding gemini-api-key \
     --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
     --role="roles/secretmanager.secretAccessor"
   ```

### Deployment with Secrets

Update the deployment command to mount the secret as an environment variable:

```bash
gcloud run deploy las-vegas-agent \
  --source . \
  --region us-central1 \
  --no-allow-unauthenticated \
  --set-env-vars SERVICE_URL=$SERVICE_URL \
  --set-secrets GEMINI_API_KEY=gemini-api-key:latest
```

### Grant invoker access

Grant invoker access to the Cloud Run service for your user account:

```bash
gcloud run services add-iam-policy-binding las-vegas-agent \
  --region us-central1 \
  --member="user:$YOUR_EMAIL" \
  --role="roles/run.invoker" \
  --project $PROJECT_ID
```

## Configuring as a Remote Subagent

To use this agent as a remote subagent in another project (like
`gemini-cli-remote-agent`), follow the steps to configure a remote agent in the
[gemini-cli-remote-agent repository](https://github.com/gitrey/gemini-cli-remote-agent).

This allows the Gemini CLI to discover the agent and route requests to it when
you use the `@las-vegas-agent` mention in prompts.

### Sample prompts

Here are some sample prompts to test the agent's capabilities, along with
example responses.

```text
@las-vegas-agent good coffee shops around the venue
```

Press `Ctrl+o` to expand agent's sample response:

```text
If you are looking for coffee options near Allegiant Stadium and Mandalay Bay,
here is what you need to know:

At Allegiant Stadium
Please note that coffee options inside the stadium are generally only
available during scheduled events:
 * Mothership Coffee Roasters: They have locations inside Allegiant Stadium
   (specifically at Stand 103 on the first floor and Stand 340 on the third
   floor) that are open during games and events.
 * Cafe Lola: Also has a location inside the stadium near Section 317, which
   operates during event hours.

At Mandalay Bay
Since Allegiant Stadium is a short 15–20 minute walk from Mandalay Bay via the
Hacienda Bridge, you have excellent, reliable options right within the resort
before you head over:

 * Hazel Coffee & Cocktails: Located within Mandalay Bay, this is a great spot
   to start your day with premium coffee and breakfast fare. Their coffee
   service typically runs from 5:00 AM to 1:00 PM daily.
 * Starbucks: There is a Starbucks located within the Mandalay Bay complex
   (in the Mandalay Place area), open daily from 5:00 AM to 7:00 PM,
   providing a familiar and convenient option.

As a reminder, the Hacienda Bridge is closed to vehicle traffic on game and
event days, making the walk from the Mandalay Bay area to the stadium very
straightforward.

```

Sample output:

```text
✦ There are several excellent coffee options near Allegiant Stadium and
  Mandalay Bay:

  Inside Allegiant Stadium (During Events)
   * Mothership Coffee Roasters: Located at Stand 103 (1st floor) and Stand
   340 (3rd floor).
   * Cafe Lola: Found near Section 317.

  At Mandalay Bay (Ideal for the walk over)
   * Hazel Coffee & Cocktails: Open 5:00 AM – 1:00 PM for premium coffee and
   breakfast.
   * Starbucks: Located in Mandalay Place, open daily 5:00 AM – 7:00 PM.

  The walk from Mandalay Bay across the Hacienda Bridge to the stadium takes
  about 15–20 minutes and is pedestrian-only on event days.
```
