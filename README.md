# paperclip-help-desk

> A self-healing support organization powered by [Paperclip](https://paperclip.ing) AI agents.

Customers submit tickets via an embeddable React widget. Three AI agents — Triage, Resolver, and Manager — collaborate to categorize, answer, and escalate issues with minimal human intervention.

## What's Included

| Component | Path | Description |
|-----------|------|-------------|
| Company Definition | `company-definition/` | Paperclip company blueprint + agent prompts |
| Bridge API | `bridge-api/` | Express/TypeScript webhook relay |
| Support Widget | `support-widget/` | Embeddable React + Tailwind dark UI |
| Knowledge Base | `knowledge-base/` | Seed FAQ docs for RAG |
| Docs | `docs/` | Setup and integration guides |

## Quick Start

```bash
# 1. Start Paperclip
npx paperclipai onboard --yes

# 2. Configure and start the bridge
cd bridge-api && cp .env.example .env
# → edit .env with your Paperclip credentials
npm install && npm run dev

# 3. Start the widget demo
cd ../support-widget
npm install && npm run dev
```

See [docs/setup.md](docs/setup.md) for the full setup walkthrough.

## Architecture

```
Browser → Widget (React) → Bridge API (Express) → Paperclip
                                                       ├── Triage Agent
                                                       ├── Resolver Agent (RAG)
                                                       └── Manager Agent (SLA + escalation)
```

## Agent Roles

- **Triage** — Classifies every ticket: Bug / Feature / Billing / Question
- **Resolver** — Answers using the knowledge base via vector search
- **Manager** — Monitors SLA, escalates to humans, gates sensitive actions with `human-approval`

## License

MIT
