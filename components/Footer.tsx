import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useLocalePath } from '../hooks/useLocalePath';

const NAV_ITEMS = [
  { labelKey: 'nav.clinic', href: '/' },
  { labelKey: 'nav.treatments', href: '/treatments' },
  { labelKey: 'nav.philosophy', href: '/philosophy' },
  { labelKey: 'nav.team', href: '/team' },
  { labelKey: 'nav.cases', href: '/cases' },
  { labelKey: 'nav.packages', href: '/packages' },
  { labelKey: 'nav.contact', href: '/book' },
];

export const Footer: React.FC = () => {
  const { t } = useTranslation();
  const lp = useLocalePath();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white pt-16 sm:pt-24 md:pt-32 pb-8 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-16 md:gap-20 mb-16 sm:mb-24 md:mb-32 items-end relative overflow-hidden">
          <img
            src="/images/zeo-logo.png"
            alt=""
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] max-w-[600px] opacity-[0.06] select-none pointer-events-none"
          />
          <div>
            <ul className="space-y-1 sm:space-y-2">
              {NAV_ITEMS.map(item => (
                <li key={item.labelKey} className="overflow-hidden">
                  <a
                    href={lp(item.href)}
                    className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif text-studio-black hover:italic hover:translate-x-4 transition-all duration-500 py-1"
                    data-cursor="hover"
                  >
                    {t(item.labelKey)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col justify-end items-start md:items-end">
            <div className="flex gap-6 sm:gap-8 mb-6 sm:mb-8">
              <a
                href="https://www.instagram.com/zeodentalclinic/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] sm:text-[10px] uppercase tracking-wide sm:tracking-ultra text-studio-black hover:text-studio-gold transition-colors py-2"
              >
                Instagram
              </a>
              <a
                href="https://www.facebook.com/people/ZEO-Dental-Clinic/61583768802581/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] sm:text-[10px] uppercase tracking-wide sm:tracking-ultra text-studio-black hover:text-studio-gold transition-colors py-2"
              >
                Facebook
              </a>
            </div>
            <p className="text-left md:text-right text-studio-gray font-light text-sm max-w-xs">
              {t('footer.tagline')}
            </p>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6 sm:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-end text-[10px] sm:text-[10px] uppercase tracking-wide sm:tracking-ultra text-gray-400 gap-2 px-4 sm:px-0">
            <div className="flex flex-col md:flex-row items-center gap-1 sm:gap-2 md:gap-3">
              <span>
                &copy; {currentYear} {t('footer.rights')}
              </span>
              <span className="hidden md:inline">•</span>
              <a
                href={lp('/privacy-policy')}
                className="hover:text-studio-gold transition-colors py-1"
              >
                Privacy Policy
              </a>
              <span className="hidden md:inline">•</span>
              <a
                href={lp('/terms-of-service')}
                className="hover:text-studio-gold transition-colors py-1"
              >
                Terms of Service
              </a>
              <span className="hidden md:inline">•</span>
              <a
                href="https://zedigital.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-studio-gold transition-colors py-1"
              >
                Made by Z.E Digital Tech
              </a>
            </div>
            <span>{t('footer.location')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
