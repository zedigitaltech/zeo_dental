import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useLocalePath } from '../hooks/useLocalePath';

const STORAGE_KEY = 'zeo-cookie-consent';

interface CookieConsentData {
  essential: boolean;
  analytics: boolean;
  timestamp: string;
}

export const CookieConsent: React.FC = () => {
  const { t } = useTranslation();
  const lp = useLocalePath();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      const timer = setTimeout(() => setVisible(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const saveConsent = (analytics: boolean) => {
    const data: CookieConsentData = {
      essential: true,
      analytics,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[70] animate-slide-up"
      role="dialog"
      aria-label="Cookie consent"
    >
      <div className="bg-studio-black/95 backdrop-blur-md border-t border-white/10">
        <div className="container mx-auto px-4 sm:px-6 md:px-12 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-[13px] leading-relaxed text-studio-gray font-light max-w-2xl">
              {t(
                'cookie.message',
                'We use cookies to enhance your browsing experience and analyze site traffic.'
              )}{' '}
              <a
                href={lp('/privacy-policy')}
                className="text-studio-gold hover:text-white underline underline-offset-2 transition-colors"
              >
                {t('cookie.learnMore', 'Learn More')}
              </a>
            </p>

            <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
              <button
                onClick={() => saveConsent(false)}
                className="flex-1 sm:flex-none px-5 py-2 text-[11px] uppercase tracking-wider text-studio-gray border border-white/20 hover:border-white/40 hover:text-white transition-all duration-300 rounded-none"
              >
                {t('cookie.essentialOnly', 'Essential Only')}
              </button>
              <button
                onClick={() => saveConsent(true)}
                className="flex-1 sm:flex-none px-5 py-2 text-[11px] uppercase tracking-wider text-studio-black bg-studio-gold hover:bg-white transition-all duration-300 rounded-none font-medium"
              >
                {t('cookie.accept', 'Accept All')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
