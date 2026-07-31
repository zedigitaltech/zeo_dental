import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import App from '../App';

// Mock child components to isolate App testing
vi.mock('../components/Header', () => ({
  Header: () => <header data-testid="header">Header</header>,
}));

vi.mock('../components/Hero', () => ({
  Hero: () => <section data-testid="hero">Hero Section</section>,
}));

vi.mock('../components/Treatments', () => ({
  Treatments: () => <section data-testid="treatments">Treatments Section</section>,
}));

vi.mock('../components/Philosophy', () => ({
  Philosophy: () => <section data-testid="philosophy">Philosophy Section</section>,
}));

vi.mock('../components/Team', () => ({
  Team: () => <section data-testid="team">Team Section</section>,
}));

vi.mock('../components/ClinicalCases', () => ({
  ClinicalCases: () => <section data-testid="clinical-cases">Clinical Cases</section>,
}));

vi.mock('../components/Footer', () => ({
  Footer: () => <footer data-testid="footer">Footer</footer>,
}));

vi.mock('../components/ChatWidget', () => ({
  ChatWidget: () => <div data-testid="chat-widget">Chat Widget</div>,
}));

vi.mock('../components/CookieConsent', () => ({
  CookieConsent: () => <div data-testid="cookie-consent">Cookie Consent</div>,
}));

vi.mock('../components/ErrorBoundary', () => ({
  ErrorBoundary: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock('../contexts/LanguageContext', () => ({
  LanguageProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
  useLanguage: () => ({
    language: 'en',
    setLanguage: vi.fn(),
    isAlbanian: false,
    isEnglish: true,
  }),
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all main sections', () => {
    render(<App />);

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('hero')).toBeInTheDocument();
    expect(screen.getByTestId('treatments')).toBeInTheDocument();
    expect(screen.getByTestId('philosophy')).toBeInTheDocument();
    expect(screen.getByTestId('team')).toBeInTheDocument();
    expect(screen.getByTestId('clinical-cases')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('renders chat widget', () => {
    render(<App />);

    expect(screen.getByTestId('chat-widget')).toBeInTheDocument();
  });

  it('includes skip-to-content link for accessibility', () => {
    render(<App />);

    const skipLink = screen.getByText('Skip to main content');
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('has main element with correct id', () => {
    render(<App />);

    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveAttribute('id', 'main-content');
  });

  it('renders without throwing errors', () => {
    expect(() => render(<App />)).not.toThrow();
  });
});
