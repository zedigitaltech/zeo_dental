import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Copy, LogOut, MessageCircle, RefreshCw } from 'lucide-react';
import {
  DepositApiError,
  STATUS_IT,
  STATUS_STYLE,
  cancelDeposit,
  conflictOf,
  createDeposit,
  formatMoney,
  listDeposits,
  type CreateResult,
  type DepositView,
} from './depositApi';

/**
 * /agent — the Italian call centre's deposit-link page. Same session model as /receptionist:
 * the password is the bearer token and lives only in sessionStorage (gone when the tab closes).
 * Payment goes to Zeo Dental Clinic's own POK account; this page never touches money.
 */

const TOKEN_KEY = 'agent_token';
const OPERATOR_KEY = 'agent_operator';

const LANGUAGES: Array<[string, string]> = [
  ['it', 'Italiano'],
  ['en', 'Inglese'],
  ['sq', 'Albanese'],
  ['de', 'Tedesco'],
  ['fr', 'Francese'],
  ['es', 'Spagnolo'],
  ['el', 'Greco'],
  ['tr', 'Turco'],
];

const NOT_CONFIGURED =
  'I link per l’acconto non sono ancora attivi (pagamenti POK non configurati). Contattare la clinica.';

const read = (k: string): string => {
  try {
    return sessionStorage.getItem(k) ?? '';
  } catch {
    return '';
  }
};
const write = (k: string, v: string | null) => {
  try {
    if (v === null) sessionStorage.removeItem(k);
    else sessionStorage.setItem(k, v);
  } catch {
    /* storage unavailable: the session just won't persist */
  }
};

const fmtDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Rome',
      })
    : '—';

const input =
  'w-full border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-studio-gold transition-colors';
const label = 'text-xs uppercase tracking-ultra text-studio-gray block mb-1';

function AgentLogin({ onLogin }: { onLogin: (token: string) => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/agent/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json().catch(() => ({}))) as { token?: string };
      if (res.ok && data.token) onLogin(data.token);
      else if (res.status === 503) setError(NOT_CONFIGURED);
      else if (res.status === 429) setError('Troppi tentativi. Riprovare tra 15 minuti.');
      else setError('Password non valida.');
    } catch {
      setError('Errore di rete. Riprovare.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-studio-black flex items-center justify-center px-6">
      <form onSubmit={submit} className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="font-serif text-4xl text-white">
            ZEO<span className="text-studio-gold">.</span>
          </h1>
          <p className="text-white/40 text-xs uppercase tracking-ultra mt-4">
            Acconti — call center
          </p>
        </div>
        <div>
          <label
            htmlFor="agent-password"
            className="text-white/40 text-xs uppercase tracking-ultra block mb-3"
          >
            Password
          </label>
          <input
            id="agent-password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-transparent border-b border-white/20 py-4 text-xl font-serif text-white focus:outline-none focus:border-studio-gold"
            required
            autoFocus
          />
        </div>
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full border border-white/20 py-4 text-white text-xs uppercase tracking-ultra hover:bg-white hover:text-studio-black transition-all disabled:opacity-50"
        >
          {busy ? '...' : 'Entra'}
        </button>
      </form>
    </div>
  );
}

export const AgentApp: React.FC = () => {
  const [token, setToken] = useState<string>(() => read(TOKEN_KEY));
  const [operator, setOperator] = useState<string>(() => read(OPERATOR_KEY));
  const [form, setForm] = useState({ name: '', phone: '', email: '', language: 'it', ref: '' });
  const [busy, setBusy] = useState(false);
  /** Blocks a second submit before React re-renders the disabled button (double click). */
  const inFlight = useRef(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<CreateResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [rows, setRows] = useState<DepositView[]>([]);
  const [loading, setLoading] = useState(false);

  const logout = useCallback(() => {
    write(TOKEN_KEY, null);
    setToken('');
  }, []);

  const handle = useCallback(
    (err: unknown) => {
      if (err instanceof DepositApiError && err.status === 401) return logout();
      if (err instanceof DepositApiError && err.status === 503) return setError(NOT_CONFIGURED);
      if (err instanceof DepositApiError && err.status === 429)
        return setError('Troppe richieste. Attendere un minuto.');
      if (err instanceof DepositApiError && err.status === 502)
        return setError('POK non ha risposto. Riprovare tra poco.');
      setError(err instanceof Error ? err.message : 'Errore');
    },
    [logout]
  );

  const refresh = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      setRows(await listDeposits(token, { limit: '50' }));
    } catch (err) {
      handle(err);
    } finally {
      setLoading(false);
    }
  }, [token, handle]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (!token) {
    return (
      <AgentLogin
        onLogin={t => {
          write(TOKEN_KEY, t);
          setToken(t);
        }}
      />
    );
  }

  const set =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setCopied(false);
    if (!form.phone.trim() && !form.email.trim()) {
      setError('Inserire almeno telefono o email.');
      return;
    }
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    const input = {
      name: form.name.trim(),
      phone: form.phone.trim() || undefined,
      email: form.email.trim() || undefined,
      language: form.language,
      call_list_ref: form.ref.trim() || undefined,
      created_by: operator.trim() || undefined,
    };
    try {
      let r;
      try {
        r = await createDeposit(token, input);
      } catch (err) {
        const conflict = conflictOf(err);
        if (!conflict) throw err;
        const ok = window.confirm(
          `C'è già un link aperto per questo contatto a nome ${conflict.name} — crearne uno nuovo?`
        );
        if (!ok) return;
        r = await createDeposit(token, { ...input, force: true });
      }
      setResult(r);
      setForm({ name: '', phone: '', email: '', language: 'it', ref: '' });
      refresh();
    } catch (err) {
      handle(err);
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const cancel = async (id: string) => {
    if (!window.confirm('Annullare questo link? Il paziente non dovrà più usarlo.')) return;
    try {
      await cancelDeposit(token, id);
    } catch (err) {
      handle(err);
    }
    refresh();
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="font-serif text-2xl text-studio-black">
              ZEO<span className="text-studio-gold">.</span>
            </span>
            <span className="hidden sm:block text-xs uppercase tracking-ultra text-studio-gray">
              Acconti
            </span>
          </div>
          <div className="flex items-center gap-3">
            <input
              aria-label="Operatore"
              placeholder="Operatore (nome)"
              value={operator}
              onChange={e => {
                setOperator(e.target.value);
                write(OPERATOR_KEY, e.target.value);
              }}
              className="border border-gray-200 px-2 py-1 text-sm w-40"
              maxLength={60}
            />
            <button
              onClick={logout}
              className="flex items-center gap-2 text-xs uppercase tracking-ultra text-studio-gray hover:text-red-500"
            >
              <LogOut className="w-4 h-4" /> Esci
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <form onSubmit={submit} className="bg-white border border-gray-100 p-6 space-y-4">
          <p className="text-sm text-studio-gray">
            Il pagamento va direttamente a Zeo Dental Clinic tramite la pagina sicura di POK. Il
            call center non riceve denaro.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="d-name" className={label}>
                Nome
              </label>
              <input
                id="d-name"
                className={input}
                value={form.name}
                onChange={set('name')}
                required
                maxLength={200}
              />
            </div>
            <div>
              <label htmlFor="d-phone" className={label}>
                Telefono
              </label>
              <input
                id="d-phone"
                className={input}
                value={form.phone}
                onChange={set('phone')}
                placeholder="+39 333 123 4567"
                maxLength={40}
              />
            </div>
            <div>
              <label htmlFor="d-email" className={label}>
                Email
              </label>
              <input
                id="d-email"
                type="email"
                className={input}
                value={form.email}
                onChange={set('email')}
                maxLength={254}
              />
            </div>
            <div>
              <label htmlFor="d-lang" className={label}>
                Lingua
              </label>
              <select
                id="d-lang"
                className={input}
                value={form.language}
                onChange={set('language')}
              >
                {LANGUAGES.map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="d-ref" className={label}>
                Riga lista / nota (facoltativo)
              </label>
              <input
                id="d-ref"
                className={input}
                value={form.ref}
                onChange={set('ref')}
                placeholder="es. 42"
                maxLength={100}
              />
            </div>
          </div>
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-studio-black text-white py-3 text-xs uppercase tracking-ultra hover:bg-studio-gold transition-colors disabled:opacity-50"
          >
            {busy ? '...' : 'Crea e invia link acconto'}
          </button>
        </form>

        {result && result.confirm_url && (
          <section className="bg-white border border-studio-gold p-6 space-y-3" aria-live="polite">
            <p className="text-sm text-studio-black">
              {result.reused
                ? 'Esisteva già un link aperto per questo paziente: eccolo.'
                : 'Link creato.'}{' '}
              {result.email_sent
                ? 'Email inviata al paziente.'
                : result.deposit.email
                  ? 'Email NON inviata.'
                  : 'Nessuna email (manca l’indirizzo).'}
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                readOnly
                value={result.confirm_url}
                className={`${input} font-mono`}
                aria-label="Link acconto"
              />
              <button
                type="button"
                onClick={() => copy(result.confirm_url!)}
                className="flex items-center justify-center gap-2 border border-gray-200 px-4 py-2 text-xs uppercase tracking-ultra hover:border-studio-black"
              >
                <Copy className="w-4 h-4" /> {copied ? 'Copiato' : 'Copia'}
              </button>
              {result.whatsapp_url && (
                <a
                  href={result.whatsapp_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 text-xs uppercase tracking-ultra hover:bg-green-700"
                >
                  <MessageCircle className="w-4 h-4" /> Apri WhatsApp
                </a>
              )}
            </div>
          </section>
        )}

        <section className="bg-white border border-gray-100">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h2 className="font-serif text-xl text-studio-black">Ultimi acconti</h2>
            <button
              onClick={refresh}
              disabled={loading}
              className="flex items-center gap-2 text-xs uppercase tracking-ultra text-studio-gray hover:text-studio-black disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Aggiorna
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-ultra text-studio-gray">
                  <th className="p-3">Creato</th>
                  <th className="p-3">Nome</th>
                  <th className="p-3">Contatto</th>
                  <th className="p-3">Importo</th>
                  <th className="p-3">Stato</th>
                  <th className="p-3">Nota</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-studio-gray">
                      Nessun acconto.
                    </td>
                  </tr>
                )}
                {rows.map(({ deposit: d, confirm_url }) => (
                  <tr key={d.id} className="border-t border-gray-100">
                    <td className="p-3 whitespace-nowrap">{fmtDate(d.created_at)}</td>
                    <td className="p-3">{d.name}</td>
                    <td className="p-3">{d.phone || d.email}</td>
                    <td className="p-3 whitespace-nowrap">
                      {formatMoney(d.amount_cents, d.currency)}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-[10px] uppercase tracking-wider font-semibold ${STATUS_STYLE[d.status]}`}
                      >
                        {STATUS_IT[d.status]}
                      </span>
                      {d.status === 'paid' && (
                        <span className="block text-[10px] text-studio-gray mt-1">
                          {fmtDate(d.paid_at)}
                        </span>
                      )}
                    </td>
                    <td className="p-3">{d.call_list_ref || ''}</td>
                    <td className="p-3 whitespace-nowrap text-right">
                      {d.status === 'pending' && confirm_url && (
                        <>
                          <button
                            type="button"
                            onClick={() => copy(confirm_url)}
                            className="text-xs underline mr-3"
                          >
                            Copia link
                          </button>
                          <button
                            type="button"
                            onClick={() => cancel(d.id)}
                            className="text-xs text-red-600 underline"
                          >
                            Annulla
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AgentApp;
