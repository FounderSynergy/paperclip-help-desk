# Integration Guide

## Architecture

```
Browser Widget → Bridge API → Paperclip (AI Agents)
```

1. User submits a ticket via the widget form.
2. The Bridge API (`POST /api/ticket`) creates a Paperclip issue.
3. Paperclip's Triage Agent picks up the issue on its next heartbeat.
4. The Resolver Agent answers using the knowledge base.
5. The Manager Agent escalates unresolved issues.
6. The widget polls `GET /api/ticket/:id/status` for live updates.

## API Reference

### `POST /api/ticket`
Submit a new support ticket.

**Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "message": "I can't find my invoice for March."
}
```

**Response (201):**
```json
{
  "ticketId": "uuid-v4",
  "identifier": "SUP-42"
}
```

### `GET /api/ticket/:ticketId/status`
Poll ticket status.

**Response:**
```json
{
  "ticketId": "uuid-v4",
  "status": "resolving",
  "resolution": null,
  "updatedAt": "2026-04-26T10:00:00Z"
}
```

**Status values:**
| Status | Meaning |
|--------|---------|
| `submitted` | Ticket created, not yet picked up |
| `triaging` | Triage Agent is categorizing |
| `resolving` | Resolver Agent is working on it |
| `resolved` | Issue closed with a response |
| `escalated` | Escalated to human operator |

### `POST /api/webhook/paperclip`
Receive push notifications from Paperclip agents (optional).

**Body:**
```json
{
  "event": "issue.updated",
  "issueId": "paperclip-issue-id",
  "companyId": "company-id",
  "status": "done",
  "comment": "Your invoice is available under Settings → Billing."
}
```

## Adding to the Knowledge Base

Add Markdown files to `/knowledge-base/`. The Resolver Agent uses vector search over these files. Structure each file as Q&A pairs:

```markdown
**Q: How do I do X?**
A: You can do X by...
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PAPERCLIP_BASE_URL` | Yes | URL of your Paperclip instance |
| `PAPERCLIP_API_KEY` | Yes | Agent API key from Paperclip UI |
| `PAPERCLIP_COMPANY_ID` | Yes | Company ID from Paperclip UI |
| `PORT` | No | Bridge API port (default: 4000) |
| `CORS_ORIGIN` | No | Widget origin for CORS (default: localhost:5173) |
