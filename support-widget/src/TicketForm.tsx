import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface TicketFormProps {
  bridgeUrl: string;
  onSubmitted: (ticketId: string) => void;
}

export function TicketForm({ bridgeUrl, onSubmitted }: TicketFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${bridgeUrl}/api/ticket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? 'Failed to submit ticket.');
      }

      const data = await res.json() as { ticketId: string };
      onSubmitted(data.ticketId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div>
        <label className="block text-xs text-zinc-400 mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Your name"
          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs text-zinc-400 mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="you@example.com"
          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs text-zinc-400 mb-1">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={4}
          placeholder="Describe your issue..."
          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
        />
      </div>

      {error && (
        <p className="text-xs text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:cursor-not-allowed text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
      >
        {loading ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            Submitting...
          </>
        ) : (
          <>
            <Send size={14} />
            Submit Ticket
          </>
        )}
      </button>
    </form>
  );
}
