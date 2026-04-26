import { TicketRecord, TicketStatus } from './types.js';

// In-memory store: ticketId -> TicketRecord
// Replace with Redis or a database for production use.
const tickets = new Map<string, TicketRecord>();

// Secondary index: issueId -> ticketId (for webhook lookups)
const issueToTicket = new Map<string, string>();

export function saveTicket(record: TicketRecord): void {
  tickets.set(record.ticketId, record);
  issueToTicket.set(record.issueId, record.ticketId);
}

export function getTicket(ticketId: string): TicketRecord | undefined {
  return tickets.get(ticketId);
}

export function getTicketByIssueId(issueId: string): TicketRecord | undefined {
  const ticketId = issueToTicket.get(issueId);
  if (!ticketId) return undefined;
  return tickets.get(ticketId);
}

export function updateTicketStatus(
  ticketId: string,
  status: TicketStatus,
  resolution?: string
): TicketRecord | undefined {
  const record = tickets.get(ticketId);
  if (!record) return undefined;

  const updated: TicketRecord = {
    ...record,
    status,
    resolution: resolution ?? record.resolution,
    updatedAt: new Date().toISOString(),
  };
  tickets.set(ticketId, updated);
  return updated;
}

export function updateTicketByIssueId(
  issueId: string,
  status: TicketStatus,
  resolution?: string
): TicketRecord | undefined {
  const ticketId = issueToTicket.get(issueId);
  if (!ticketId) return undefined;
  return updateTicketStatus(ticketId, status, resolution);
}
