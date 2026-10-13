import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';

vi.mock('../../contexts/LanguageContext', () => ({
  LanguageProvider: ({ children }: { children: ReactNode }) => children,
  useLanguage: () => ({ language: 'it', setLanguage: vi.fn() }),
}));

// Real Italian strings, so the Meta wording is checked too.
vi.mock('../../hooks/useTranslation', async () => {
  const it = (await import('../../translations/it.json')).default as Record<string, unknown>;
  const t = (key: string) => {
    const v = key
      .split('.')
      .reduce<unknown>((o, k) => (o as Record<string, unknown> | undefined)?.[k], it);
    return typeof v === 'string' ? v : key;
  };
  return { useTranslation: () => ({ t, language: 'it' }) };
});

import { Booking } from '../../components/Booking';
import { answersPayload, firstUnanswered } from '../../components/BookingQuestions';

const fill = () => {
  fireEvent.change(screen.getByPlaceholderText('John Doe'), { target: { value: 'Dario Prova' } });
  fireEvent.change(screen.getByPlaceholderText('john@example.com'), {
    target: { value: 'dario@example.it' },
  });
};

describe('BookingQuestions helpers', () => {
  it('firstUnanswered and answersPayload', () => {
    expect(firstUnanswered({ treatment_interest: '', has_xray: '', travel_timeframe: '' })).toBe(
      'treatment_interest'
    );
    expect(
      firstUnanswered({ treatment_interest: 'veneers', has_xray: 'no', travel_timeframe: '' })
    ).toBe('travel_timeframe');
    expect(
      answersPayload({
        treatment_interest: 'implants',
        has_xray: 'no',
        travel_timeframe: 'over_3_months',
      })
    ).toEqual({
      treatment_interest: 'implants',
      has_xray: false,
      travel_timeframe: 'over_3_months',
    });
  });
});

describe('Booking form: Meta-form questions', () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    fetchMock.mockReset();
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, booking: { id: 'b1' } }),
    });
    vi.stubGlobal('fetch', fetchMock);
    Element.prototype.scrollIntoView = vi.fn();
  });
  afterEach(() => vi.unstubAllGlobals());

  it('shows the three questions with the Meta wording as radio groups', () => {
    render(<Booking />);
    expect(
      screen.getByRole('group', { name: /Per quale servizio orale sei interessato\?/ })
    ).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Faccette dentali' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Tra più di 3 mesi' })).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(8);
  });

  it('does not submit until all three are answered, then sends them', async () => {
    render(<Booking />);
    fill();
    fireEvent.submit(document.getElementById('booking-form')!);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getAllByText('Rispondi a questa domanda.')).toHaveLength(3);

    fireEvent.click(screen.getByRole('radio', { name: 'Impianti dentali' }));
    fireEvent.click(screen.getByRole('radio', { name: 'Sì' }));
    fireEvent.click(screen.getByRole('radio', { name: 'Entro 30 giorni' }));
    fireEvent.submit(document.getElementById('booking-form')!);

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body).toMatchObject({
      treatment_interest: 'implants',
      has_xray: true,
      travel_timeframe: 'within_30_days',
      language: 'it',
    });
  });

  it('X-ray "Sì" shows the hint and its link moves focus to the upload area', () => {
    render(<Booking />);
    expect(screen.queryByText('Carica ora')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: 'Sì' }));
    fireEvent.click(screen.getByText('Carica ora'));
    const upload = screen.getByRole('button', { name: /Carica Radiografia|Radiografia/i });
    expect(document.activeElement).toBe(upload);
    expect(upload.className).toContain('border-studio-gold');
  });
});
