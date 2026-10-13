/** Client side of /api/agent/deposits, shared by the /agent page and the reception dashboard. */

export type DepositStatus = 'pending' | 'paid' | 'expired' | 'cancelled' | 'failed';

export interface Deposit {
  id: string;
  booking_id: string | null;
  name: string;
  phone: string | null;
  email: string | null;
  language: string;
  amount_cents: number;
  currency: string;
  status: DepositStatus;
  created_by: string | null;
  call_list_ref: string | null;
  created_at: string;
  paid_at: string | null;
  expires_at: string | null;
}

export interface DepositView {
  deposit: Deposit;
  confirm_url: string | null;
  whatsapp_url: string | null;
}

export interface CreateResult extends DepositView {
  reused: boolean;
  email_sent: boolean;
}

export interface CreateInput {
  name: string;
  phone?: string;
  email?: string;
  language?: string;
  booking_id?: string;
  call_list_ref?: string;
  created_by?: string;
  send_email?: boolean;
  force?: boolean;
}

/** Errors the UI distinguishes: 401 = log in again, 503 = deposits switched off. */
export class DepositApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly body: Record<string, unknown> = {}
  ) {
    super(message);
    this.name = 'DepositApiError';
  }
}

async function request<T>(token: string, url: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init.headers ?? {}),
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  let body: Record<string, unknown> = {};
  try {
    body = (await res.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }
  if (!res.ok || body.success === false) {
    throw new DepositApiError(res.status, String(body.error ?? body.message ?? res.status), body);
  }
  return body as T;
}

export const listDeposits = (token: string, params: Record<string, string> = {}) =>
  request<{ deposits: DepositView[] }>(
    token,
    `/api/agent/deposits?${new URLSearchParams(params)}`
  ).then(r => r.deposits);

export const createDeposit = (token: string, input: CreateInput) =>
  request<CreateResult>(token, '/api/agent/deposits', {
    method: 'POST',
    body: JSON.stringify(input),
  });

export const cancelDeposit = (token: string, id: string) =>
  request<{ deposit: Deposit }>(token, `/api/agent/deposits/${encodeURIComponent(id)}/cancel`, {
    method: 'POST',
  });

export function formatMoney(cents: number, currency: string, locale = 'it-IT'): string {
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency}`;
  }
}

export const STATUS_STYLE: Record<DepositStatus, string> = {
  pending: 'bg-amber-50 text-amber-700',
  paid: 'bg-green-50 text-green-700',
  expired: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-50 text-red-700',
  failed: 'bg-red-50 text-red-700',
};

export const STATUS_IT: Record<DepositStatus, string> = {
  pending: 'In attesa',
  paid: 'Pagato',
  expired: 'Scaduto',
  cancelled: 'Annullato',
  failed: 'Errore',
};

export const STATUS_SQ: Record<DepositStatus, string> = {
  pending: 'Në pritje',
  paid: 'Paguar',
  expired: 'Skaduar',
  cancelled: 'Anuluar',
  failed: 'Gabim',
};

export const STATUS_EN: Record<DepositStatus, string> = {
  pending: 'Pending',
  paid: 'Paid',
  expired: 'Expired',
  cancelled: 'Cancelled',
  failed: 'Failed',
};

/** 409 "open link for this contact under another name": who holds it, or null for other errors. */
export function conflictOf(
  err: unknown
): { name: string; status: string; created_at: string } | null {
  if (!(err instanceof DepositApiError) || err.status !== 409) return null;
  const c = err.body.conflict as
    | { name?: unknown; status?: unknown; created_at?: unknown }
    | undefined;
  return c && typeof c.name === 'string'
    ? { name: c.name, status: String(c.status ?? ''), created_at: String(c.created_at ?? '') }
    : null;
}
