import { useEffect, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';

type TicketStatus = 'submitted' | 'triaging' | 'resolving' | 'resolved' | 'escalated';

interface StatusResponse {
  ticketId: string;
  status: TicketStatus;
  resolution: string | null;
  updatedAt: string;
}

interface StatusBannerProps {
  ticketId: string;
  bridgeUrl: string;
  onReset: () => void;
}

const STATUS_LABELS: Record<TicketStatus, string> = {
  submitted: 'Ticket received. Queuing for triage...',
  triaging: 'AI Triage Agent is categorizing your issue...',
  resolving: 'AI Agent is researching your issue...',
  resolved: 'Issue resolved!',
  escalated: 'Escalated to a human operator.',
};

const POLL_INTERVAL_MS = 5000;

export function StatusBanner({ ticketId, bridgeUrl, onReset }: StatusBannerProps) {
  const [data, setData] = useState<StatusResponse | null>(null);
  const [pollError, setPollError] = useState(false);

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`${bridgeUrl}/api/ticket/${ticketId}/status`);
      if (!res.ok) throw new Error('Poll failed');
      const json = await res.json() as StatusResponse;
      setData(json);
      setPollError(false);
    } catch {
      setPollError(true);
    }
  }, [ticketId, bridgeUrl]);

  useEffect(() => {
    poll();
    const interval = setInterval(() => {
      if (data?.status === 'resolved' || data?.status === 'escalated') return;
      poll();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [poll, data?.status]);

  const status = data?.status ?? 'submitted';
  const isTerminal = status === 'resolved' || status === 'escalated';

  return (
    <div className="flex flex-col gap-4">
      {/* Status indicator */}
      <div className="flex items-start gap-3 bg-zinc-900 border border-zinc-800 rounded-lg p-3">
        <div className="mt-0.5 flex-shrink-0">
          {status === 'resolved' ? (
            <CheckCircle2 size={16} className="text-green-400" />
          ) : status === 'escalated' ? (
            <AlertTriangle size={16} className="text-yellow-400" />
          ) : pollError ? (
            <RefreshCw size={16} className="text-zinc-500" />
          ) : (
            <Loader2 size={16} className="text-blue-400 animate-spin" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-zinc-300">{STATUS_LABELS[status]}</p>
          {pollError && (
            <p className="text-xs text-zinc-500 mt-1">Connection issue — retrying...</p>
          )}
        </div>
      </div>

      {/* Resolution text */}
      {data?.resolution && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3">
          <p className="text-xs text-zinc-400 mb-1 font-medium">Response</p>
          <p className="text-sm text-zinc-200 leading-relaxed">{data.resolution}</p>
        </div>
      )}

      {/* Ticket reference */}
      <p className="text-xs text-zinc-600 text-center">
        Ticket ID: <span className="font-mono">{ticketId.slice(0, 8)}</span>
      </p>

      {/* New ticket button (only after terminal state) */}
      {isTerminal && (
        <button
          onClick={onReset}
          className="w-full text-sm text-zinc-400 hover:text-zinc-200 py-2 border border-zinc-800 rounded-lg transition-colors"
        >
          Submit another ticket
        </button>
      )}
    </div>
  );
}
