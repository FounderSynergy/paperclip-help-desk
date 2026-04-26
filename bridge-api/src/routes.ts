import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as store from './store.js';
import * as paperclip from './paperclip-client.js';
import {
  TicketSubmission,
  TicketRecord,
  WebhookPayload,
} from './types.js';

const router = Router();

// POST /api/ticket — Accept a new support ticket from the widget
router.post('/ticket', async (req: Request, res: Response): Promise<void> => {
  const { name, email, message } = req.body as Partial<TicketSubmission>;

  if (!name || !email || !message) {
    res.status(400).json({ error: 'name, email, and message are required.' });
    return;
  }

  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: 'Invalid email address.' });
    return;
  }

  try {
    const issue = await paperclip.createIssue({
      title: `[Support] ${message.slice(0, 80)}`,
      description: `**From:** ${name} <${email}>\n\n${message}`,
      priority: 'medium',
      status: 'todo',
    });

    const ticketId = uuidv4();
    const record: TicketRecord = {
      ticketId,
      issueId: issue.id,
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.saveTicket(record);

    res.status(201).json({ ticketId, identifier: issue.identifier });
  } catch (err) {
    console.error('[POST /api/ticket]', err);
    res.status(502).json({ error: 'Failed to create support ticket. Please try again.' });
  }
});

// GET /api/ticket/:id/status — Poll ticket status
router.get('/ticket/:id/status', async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const record = store.getTicket(id);

  if (!record) {
    res.status(404).json({ error: 'Ticket not found.' });
    return;
  }

  // Sync status from Paperclip on every poll
  try {
    const issue = await paperclip.getIssue(record.issueId);
    const mapped = paperclip.mapIssueStatus(issue.status);
    if (mapped !== record.status) {
      store.updateTicketStatus(id, mapped);
    }
  } catch {
    // Non-fatal: return cached status if Paperclip is unreachable
  }

  const fresh = store.getTicket(id)!;
  res.json({
    ticketId: fresh.ticketId,
    status: fresh.status,
    resolution: fresh.resolution ?? null,
    updatedAt: fresh.updatedAt,
  });
});

// POST /api/webhook/paperclip — Receive push updates from Paperclip agents
router.post('/webhook/paperclip', (req: Request, res: Response): void => {
  const payload = req.body as WebhookPayload;

  if (!payload.issueId || !payload.event) {
    res.status(400).json({ error: 'issueId and event are required.' });
    return;
  }

  const mapped = paperclip.mapIssueStatus(payload.status ?? '');
  const updated = store.updateTicketByIssueId(
    payload.issueId,
    mapped,
    payload.comment
  );

  if (!updated) {
    // Unknown issueId — not an error, agent may post for issues not originated here
    res.status(200).json({ ok: true, note: 'issue not tracked by bridge' });
    return;
  }

  console.log(`[webhook] ticket ${updated.ticketId} → ${mapped}`);
  res.status(200).json({ ok: true });
});

// POST /api/tools/db-lookup — Stub customer lookup tool for agents
router.post('/tools/db-lookup', (req: Request, res: Response): void => {
  const { email } = req.body as { email?: string };

  if (!email) {
    res.status(400).json({ error: 'email is required.' });
    return;
  }

  // Stub response — replace with real DB query in production
  res.json({
    found: true,
    customerId: 'cust_stub_001',
    plan: 'pro',
    status: 'active',
    recentEvents: ['Subscribed 2026-01-01', 'Invoice paid 2026-04-01'],
  });
});

export default router;
