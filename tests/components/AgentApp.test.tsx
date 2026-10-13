import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';

vi.mock('../../contexts/LanguageContext', () => ({
  LanguageProvider: ({ children }: { children: ReactNode }) => children,
  useLanguage: () => ({ language: 'it', setLanguage: vi.fn() }),
}));

import { AgentApp } from '../../components/agent/AgentApp';
import { PAY_COPY, PayResultPage } from '../../components/pay/PayResultPage';

const json = (body: unknown, status = 200) =>
  Promise.resolve(new Response(JSON.stringify(body), { status }));

describe('AgentApp', () => {
  beforeEach(() => sessionStorage.clear());
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('shows "not configured" when the deposit API answers 503', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      json({ success: false, error: 'Deposits not configured' }, 503)
    );
    render(<AgentApp />);
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'x' } });
    fireEvent.click(screen.getByText('Entra'));
    expect(await screen.findByText(/non sono ancora attivi/)).toBeTruthy();
    expect(sessionStorage.getItem('agent_token')).toBeNull();
  });

  it('creates a link and shows Copia + Apri WhatsApp', async () => {
    sessionStorage.setItem('agent_token', 't'.repeat(40));
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    vi.spyOn(globalThis, 'fetch').mockImplementation((input, init) => {
      const url = String(input);
      calls.push({ url, init });
      if (url.startsWith('/api/agent/deposits?')) return json({ success: true, deposits: [] });
      return json({
        success: true,
        reused: false,
        email_sent: true,
        confirm_url: 'https://checkout.example.invalid/o1',
        whatsapp_url: 'https://wa.me/393331234567?text=x',
        deposit: { id: 'd1', email: 'a@example.invalid' },
      });
    });
    render(<AgentApp />);
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Mario Prova' } });
    fireEvent.change(screen.getByLabelText('Telefono'), { target: { value: '+39 333 123 4567' } });
    fireEvent.click(screen.getByText('Crea e invia link acconto'));

    expect(await screen.findByText('Apri WhatsApp')).toBeTruthy();
    expect(screen.getByDisplayValue('https://checkout.example.invalid/o1')).toBeTruthy();
    expect(screen.getByText(/Email inviata/)).toBeTruthy();
    const post = calls.find(c => c.init?.method === 'POST')!;
    expect(post.url).toBe('/api/agent/deposits');
    expect(JSON.parse(String(post.init!.body))).toEqual({
      name: 'Mario Prova',
      phone: '+39 333 123 4567',
      language: 'it',
    });
    expect(new Headers(post.init!.headers).get('authorization')).toBe(`Bearer ${'t'.repeat(40)}`);
  });

  it('on a name conflict asks the agent, then retries with force:true', async () => {
    sessionStorage.setItem('agent_token', 't'.repeat(40));
    const posts: unknown[] = [];
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(globalThis, 'fetch').mockImplementation((input, init) => {
      if (String(input).startsWith('/api/agent/deposits?'))
        return json({ success: true, deposits: [] });
      posts.push(JSON.parse(String(init?.body)));
      return posts.length === 1
        ? json(
            {
              success: false,
              reused: false,
              conflict: { name: 'Anna Rossi', status: 'pending', created_at: '' },
            },
            409
          )
        : json({
            success: true,
            reused: false,
            email_sent: false,
            confirm_url: 'https://checkout.example.invalid/o2',
            whatsapp_url: null,
            deposit: { id: 'd2', email: null },
          });
    });
    render(<AgentApp />);
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Luca Rossi' } });
    fireEvent.change(screen.getByLabelText('Telefono'), { target: { value: '3334445555' } });
    const btn = screen.getByText('Crea e invia link acconto');
    fireEvent.click(btn);
    fireEvent.click(btn); // double click: still one request at a time
    expect(await screen.findByDisplayValue('https://checkout.example.invalid/o2')).toBeTruthy();
    expect(window.confirm).toHaveBeenCalledWith(
      "C'è già un link aperto per questo contatto a nome Anna Rossi — crearne uno nuovo?"
    );
    expect(posts).toHaveLength(2);
    expect((posts[1] as { force?: boolean }).force).toBe(true);
  });

  it('needs a phone or an email before calling the API', async () => {
    sessionStorage.setItem('agent_token', 't'.repeat(40));
    const spy = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation(() => json({ success: true, deposits: [] }));
    render(<AgentApp />);
    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1));
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Mario' } });
    fireEvent.click(screen.getByText('Crea e invia link acconto'));
    expect(await screen.findByText(/almeno telefono o email/)).toBeTruthy();
    expect(spy).toHaveBeenCalledTimes(1);
  });
});

describe('PayResultPage', () => {
  it('the thanks page never claims the payment is done', () => {
    render(<PayResultPage outcome="thanks" />);
    expect(screen.getByText('Grazie')).toBeTruthy();
    expect(screen.getByText(/confermerà via email/)).toBeTruthy();
    for (const c of Object.values(PAY_COPY)) {
      expect(c.thanksBody).not.toMatch(
        /pagamento (è )?(stato )?ricevuto|payment (was|has been) received/i
      );
    }
  });
});
