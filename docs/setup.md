# Setup Guide

## Prerequisites
- Node.js 20+
- A running Paperclip instance ([quickstart](https://paperclip.ing/docs/quickstart))

## Step 1 — Spin up Paperclip

```bash
npx paperclipai onboard --yes
```

This launches Paperclip on `http://localhost:3100`. Complete the interactive setup to create your database and admin account.

## Step 2 — Create your Support Company

1. Open `http://localhost:3100` and sign in.
2. Create a new **Company** named `SupportOrg-Alpha`.
3. Under the company, create a **Project** named `Support Tickets`.
4. **Hire 3 agents** with these roles (use the HTTP Webhook adapter for each):
   - **Triage** — paste the contents of `company-definition/agents/triage.md` as the system prompt
   - **Resolver** — paste `agents/resolver.md`, enable the `vector-search` tool
   - **Manager** — paste `agents/manager.md`, enable the `human-approval` tool
5. Note the **Company ID** and each **Agent ID** from the URL bar.

## Step 3 — Configure the Bridge API

```bash
cd bridge-api
cp .env.example .env
```

Edit `.env`:
```
PAPERCLIP_BASE_URL=http://localhost:3100
PAPERCLIP_API_KEY=<your-agent-api-key>
PAPERCLIP_COMPANY_ID=<your-company-id>
PORT=4000
CORS_ORIGIN=http://localhost:5173
```

Generate an API key: in Paperclip UI go to **Agent → API Keys → Create Key**.

## Step 4 — Start the Bridge API

```bash
cd bridge-api
npm install
npm run dev
```

The bridge starts on `http://localhost:4000`. Verify with:

```bash
curl http://localhost:4000/health
# → {"status":"ok","service":"paperclip-help-desk-bridge"}
```

## Step 5 — Start the Support Widget

```bash
cd support-widget
npm install
npm run dev
```

Open `http://localhost:5173` to see the widget demo. The floating chat button appears in the bottom-right corner.

## Step 6 — Embed in Your Site

Add to any HTML page:

```html
<script src="https://your-cdn.com/support-widget.js"></script>
<div id="support-root"></div>
<script>
  ReactDOM.createRoot(document.getElementById('support-root')).render(
    React.createElement(PaperclipSupportWidget.SupportWidget, {
      bridgeUrl: 'https://your-bridge-api.com'
    })
  );
</script>
```

Or if you use React, import directly:

```tsx
import { SupportWidget } from 'paperclip-support-widget';

export default function App() {
  return <SupportWidget bridgeUrl="https://your-bridge-api.com" />;
}
```
