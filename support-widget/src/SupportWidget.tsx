import { useState } from 'react';
import { MessageSquare, X } from 'lucide-react';
import { TicketForm } from './TicketForm';
import { StatusBanner } from './StatusBanner';

export interface SupportWidgetProps {
  bridgeUrl?: string;
}

type WidgetView = 'closed' | 'form' | 'status';

export function SupportWidget({ bridgeUrl = 'http://localhost:4000' }: SupportWidgetProps) {
  const [view, setView] = useState<WidgetView>('closed');
  const [ticketId, setTicketId] = useState<string | null>(null);

  const open = () => setView('form');
  const close = () => setView('closed');

  const handleSubmitted = (id: string) => {
    setTicketId(id);
    setView('status');
  };

  const handleReset = () => {
    setTicketId(null);
    setView('form');
  };

  return (
    <div className="fixed bottom-5 right-5 flex flex-col items-end gap-3 z-50">
      {/* Panel */}
      {view !== 'closed' && (
        <div className="w-80 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-zinc-100 text-sm font-semibold">AI Support</span>
            </div>
            <button
              onClick={close}
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
              aria-label="Close support widget"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-4">
            {view === 'form' && (
              <TicketForm bridgeUrl={bridgeUrl} onSubmitted={handleSubmitted} />
            )}
            {view === 'status' && ticketId && (
              <StatusBanner
                ticketId={ticketId}
                bridgeUrl={bridgeUrl}
                onReset={handleReset}
              />
            )}
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={view === 'closed' ? open : close}
        className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white p-4 rounded-full shadow-2xl hover:scale-105 transition-all active:scale-95"
        aria-label="Open support chat"
      >
        {view !== 'closed' ? <X size={22} /> : <MessageSquare size={22} />}
      </button>
    </div>
  );
}
