import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Copy, CreditCard, MessageCircle } from 'lucide-react';
import {
  DepositApiError,
  STATUS_EN,
  STATUS_SQ,
  STATUS_STYLE,
  conflictOf,
  createDeposit,
  formatMoney,
  listDeposits,
  type CreateResult,
  type DepositView,
} from '../agent/depositApi';

interface DepositPanelProps {
  token: string;
  language: string;
  booking: {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    language?: string | null;
  };
}

/**
 * Deposit status of one booking and a "send deposit link" action (admin token; same API as /agent).
 * Hidden entirely while deposits are not configured (503).
 */
export const DepositPanel: React.FC<DepositPanelProps> = ({ token, language, booking }) => {
  const sq = language === 'sq';
  const L = sq ? STATUS_SQ : STATUS_EN;
  const [rows, setRows] = useState<DepositView[] | null>(null);
  const [off, setOff] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<CreateResult | null>(null);
  const inFlight = useRef(false);

  const load = useCallback(async () => {
    try {
      setRows(await listDeposits(token, { booking_id: booking.id, limit: '5' }));
    } catch (err) {
      if (err instanceof DepositApiError && err.status === 503) setOff(true);
      else setRows([]);
    }
  }, [token, booking.id]);

  useEffect(() => {
    load();
  }, [load]);

  if (off) return null;

  const send = async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError('');
    const input = {
      name: booking.name,
      phone: booking.phone || undefined,
      email: booking.email || undefined,
      language: booking.language || undefined,
      booking_id: booking.id,
    };
    try {
      let r;
      try {
        r = await createDeposit(token, input);
      } catch (err) {
        const conflict = conflictOf(err);
        if (!conflict) throw err;
        const ok = window.confirm(
          sq
            ? `Ka një lidhje të hapur për këtë kontakt në emër të ${conflict.name}. Të krijohet një e re?`
            : `An open link exists for this contact under ${conflict.name}. Create a new one?`
        );
        if (!ok) return;
        r = await createDeposit(token, { ...input, force: true });
      }
      setResult(r);
      load();
    } catch (err) {
      setError(
        err instanceof DepositApiError && err.status === 502
          ? sq
            ? 'POK nuk u përgjigj. Provoni sërish.'
            : 'POK did not answer. Try again.'
          : err instanceof Error
            ? err.message
            : 'Error'
      );
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };

  const latest = rows?.[0];
  return (
    <div className="mb-6 p-4 border border-gray-100 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs uppercase tracking-ultra text-studio-gray">
          {sq ? 'Parapagimi' : 'Deposit'}
        </span>
        {latest ? (
          <span
            className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-wider font-semibold ${STATUS_STYLE[latest.deposit.status]}`}
          >
            {L[latest.deposit.status]} ·{' '}
            {formatMoney(
              latest.deposit.amount_cents,
              latest.deposit.currency,
              sq ? 'sq-AL' : 'en-GB'
            )}
          </span>
        ) : (
          <span className="text-sm text-studio-gray">{rows ? '—' : '...'}</span>
        )}
      </div>
      {latest?.deposit.status !== 'paid' && (
        <button
          type="button"
          onClick={send}
          disabled={busy || rows === null}
          className="w-full flex items-center justify-center gap-2 border border-studio-gold py-2 text-xs uppercase tracking-ultra hover:bg-studio-gold hover:text-white transition-colors disabled:opacity-50"
        >
          <CreditCard className="w-4 h-4" />
          {busy ? '...' : sq ? 'Dërgo lidhjen e parapagimit' : 'Send deposit link'}
        </button>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {result?.confirm_url && (
        <div className="space-y-2">
          <p className="text-xs text-studio-gray">
            {result.email_sent
              ? sq
                ? 'Email-i u dërgua.'
                : 'Email sent.'
              : sq
                ? 'Email-i nuk u dërgua.'
                : 'No email sent.'}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(result.confirm_url!)}
              className="flex items-center gap-1 text-xs underline"
            >
              <Copy className="w-3.5 h-3.5" /> {sq ? 'Kopjo lidhjen' : 'Copy link'}
            </button>
            {result.whatsapp_url && (
              <a
                href={result.whatsapp_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs underline text-green-700"
              >
                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
