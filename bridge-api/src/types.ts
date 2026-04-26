export type TicketStatus =
  | 'submitted'
  | 'triaging'
  | 'resolving'
  | 'resolved'
  | 'escalated';

export interface TicketSubmission {
  name: string;
  email: string;
  message: string;
}

export interface TicketRecord {
  ticketId: string;
  issueId: string;
  status: TicketStatus;
  resolution?: string;
  submittedAt: string;
  updatedAt: string;
}

export interface PaperclipIssue {
  id: string;
  identifier: string;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
}

export interface CreateIssuePayload {
  title: string;
  description: string;
  priority?: 'critical' | 'high' | 'medium' | 'low';
  status?: string;
}

export interface WebhookPayload {
  event: string;
  issueId: string;
  companyId: string;
  status?: string;
  comment?: string;
}
