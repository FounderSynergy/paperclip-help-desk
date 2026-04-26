import { CreateIssuePayload, PaperclipIssue } from './types.js';

const BASE_URL = process.env.PAPERCLIP_BASE_URL ?? 'http://localhost:3100';
const API_KEY = process.env.PAPERCLIP_API_KEY ?? '';
const COMPANY_ID = process.env.PAPERCLIP_COMPANY_ID ?? '';

function headers(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${API_KEY}`,
  };
}

export async function createIssue(
  payload: CreateIssuePayload
): Promise<PaperclipIssue> {
  const url = `${BASE_URL}/api/companies/${COMPANY_ID}/issues`;
  const res = await fetch(url, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Paperclip createIssue failed [${res.status}]: ${text}`);
  }

  return res.json() as Promise<PaperclipIssue>;
}

export async function getIssue(issueId: string): Promise<PaperclipIssue> {
  const url = `${BASE_URL}/api/companies/${COMPANY_ID}/issues/${issueId}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: headers(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Paperclip getIssue failed [${res.status}]: ${text}`);
  }

  return res.json() as Promise<PaperclipIssue>;
}

// Maps a Paperclip issue status string to our internal TicketStatus
export function mapIssueStatus(
  paperclipStatus: string
): 'submitted' | 'triaging' | 'resolving' | 'resolved' | 'escalated' {
  switch (paperclipStatus) {
    case 'backlog':
    case 'todo':
      return 'triaging';
    case 'in_progress':
      return 'resolving';
    case 'in_review':
      return 'resolving';
    case 'done':
      return 'resolved';
    case 'cancelled':
    case 'blocked':
      return 'escalated';
    default:
      return 'submitted';
  }
}
