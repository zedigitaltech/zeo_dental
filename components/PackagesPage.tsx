import React from 'react';
import { Check, Plane, Hotel, MapPin, MessageCircle } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { useLocalePath } from '../hooks/useLocalePath';
import { Header } from './Header';
import { Footer } from './Footer';
import { ChatWidget } from './ChatWidget';
import { WhatsAppButton } from './WhatsAppButton';

interface PackageTier {
  key: string;
  featured?: boolean;
  icon: string;
}

const TIERS: PackageTier[] = [
  { key: 'essential', icon: '✦' },
  { key: 'premium', featured: true, icon: '★' },
  { key: 'vip', icon: '♛' },
];

const STEPS = ['step1', 'step2', 'step3', 'step4'] as const;

export const PackagesPage: React.FC = () => {
  const { t, tRaw } = useTranslation();
  const lp = useLocalePath();

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        {/* Hero */}
        <section className="relative min-h-[60vh] flex items-center justify-center bg-studio-black overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1555992643-a340af1e5b51?auto=format&fit=crop&q=80&w=1600"
              alt=""
              className="w-full h-full object-cover opacity-30 grayscale"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-studio-black via-studio-black/60 to-studio-black/40" />
          </div>
          <div className="relative z-10 text-center px-4 sm:px-6 py-32 sm:py-40">
            <span className="block text-studio-gold text-[10px] uppercase tracking-ultra mb-6">
              {t('packages.label')}
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white mb-6">
              {t('packages.title')}
            </h1>
            <p className="text-white/50 font-light text-base sm:text-lg max-w-2xl mx-auto">
              {t('packages.subtitle')}
            </p>
          </div>
        </section>

        {/* Package Tiers */}
        <section className="py-16 sm:py-20 md:py-28 bg-white">
          <div className="container mx-auto px-4 sm:px-6 md:px-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
              {TIERS.map(tier => {
                const includes = tRaw(`packages.${tier.key}.includes`) as string[] | undefined;
                return (
                  <div
                    key={tier.key}
                    className={`relative p-8 sm:p-10 border transition-all duration-300 ${
                      tier.featured
                        ? 'border-studio-gold bg-studio-black text-white scale-[1.02] shadow-2xl'
                        : 'border-gray-200 bg-white text-studio-black hover:border-studio-gold/50'
                    }`}
                  >
                    {tier.featured && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-studio-gold text-white text-[9px] uppercase tracking-ultra px-4 py-1">
                        {t('packages.popular')}
                      </span>
                    )}
                    <div className="text-center mb-8">
                      <span className="text-3xl mb-4 block">{tier.icon}</span>
                      <h3 className="font-serif text-2xl sm:text-3xl mb-2">
                        {t(`packages.${tier.key}.name`)}
                      </h3>
                      <p
                        className={`text-sm font-light ${tier.featured ? 'text-white/50' : 'text-studio-gray'}`}
                      >
                        {t(`packages.${tier.key}.tagline`)}
                      </p>
                    </div>
                    <ul className="space-y-3 mb-10">
                      {Array.isArray(includes) &&
                        includes.map((item, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <Check
                              size={16}
                              className={`mt-0.5 flex-shrink-0 ${tier.featured ? 'text-studio-gold' : 'text-studio-gold'}`}
                            />
                            <span
                              className={`text-sm font-light ${tier.featured ? 'text-white/80' : 'text-studio-gray'}`}
                            >
                              {item}
                            </span>
                          </li>
                        ))}
                    </ul>
                    <a
                      href={`${lp('/book')}?package=${tier.key}`}
                      className={`block text-center text-[10px] uppercase tracking-ultra py-4 transition-colors duration-300 ${
                        tier.featured
                          ? 'bg-studio-gold text-white hover:bg-studio-gold/90'
                          : 'border border-studio-black text-studio-black hover:bg-studio-black hover:text-white'
                      }`}
                      data-cursor="hover"
                    >
                      {t('packages.cta')}
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 sm:py-20 md:py-28 bg-neutral-50">
          <div className="container mx-auto px-4 sm:px-6 md:px-12">
            <div className="text-center mb-14 sm:mb-20">
              <span className="block text-studio-gold text-[10px] uppercase tracking-ultra mb-4">
                {t('packages.processLabel')}
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-studio-black">
                {t('packages.howItWorks')}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 max-w-5xl mx-auto">
              {STEPS.map((step, i) => (
                <div key={step} className="text-center">
                  <div className="w-14 h-14 mx-auto mb-5 flex items-center justify-center border border-studio-gold/30 text-studio-gold font-serif text-xl">
                    {i + 1}
                  </div>
                  <h3 className="font-serif text-lg mb-2 text-studio-black">
                    {t(`packages.${step}.title`)}
                  </h3>
                  <p className="text-studio-gray text-sm font-light">
                    {t(`packages.${step}.desc`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Travel Info */}
        <section className="py-16 sm:py-20 md:py-28 bg-white">
          <div className="container mx-auto px-4 sm:px-6 md:px-12">
            <div className="text-center mb-14 sm:mb-20">
              <span className="block text-studio-gold text-[10px] uppercase tracking-ultra mb-4">
                {t('packages.travelLabel')}
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-studio-black">
                {t('packages.travelTitle')}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <Plane size={28} className="mx-auto mb-4 text-studio-gold" />
                <h3 className="font-serif text-base mb-2">{t('packages.travel.flightsTitle')}</h3>
                <p className="text-studio-gray text-sm font-light">
                  {t('packages.travel.flights')}
                </p>
              </div>
              <div className="text-center">
                <Hotel size={28} className="mx-auto mb-4 text-studio-gold" />
                <h3 className="font-serif text-base mb-2">{t('packages.travel.hotelsTitle')}</h3>
                <p className="text-studio-gray text-sm font-light">{t('packages.travel.hotels')}</p>
              </div>
              <div className="text-center">
                <MapPin size={28} className="mx-auto mb-4 text-studio-gold" />
                <h3 className="font-serif text-base mb-2">{t('packages.travel.transferTitle')}</h3>
                <p className="text-studio-gray text-sm font-light">
                  {t('packages.travel.transfer')}
                </p>
              </div>
              <div className="text-center">
                <MessageCircle size={28} className="mx-auto mb-4 text-studio-gold" />
                <h3 className="font-serif text-base mb-2">{t('packages.travel.supportTitle')}</h3>
                <p className="text-studio-gray text-sm font-light">
                  {t('packages.travel.support')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 sm:py-28 bg-studio-black text-center">
          <div className="container mx-auto px-4 sm:px-6 md:px-12">
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white mb-6">
              {t('packages.ctaTitle')}
            </h2>
            <p className="text-white/50 font-light max-w-xl mx-auto mb-10">
              {t('packages.ctaDesc')}
            </p>
            <a
              href={lp('/book')}
              className="inline-block bg-studio-gold text-white text-[10px] sm:text-xs uppercase tracking-ultra px-10 sm:px-14 py-4 hover:bg-studio-gold/90 transition-colors duration-300"
              data-cursor="hover"
            >
              {t('packages.cta')}
            </a>
          </div>
        </section>
      </main>
      <Footer />
      <ChatWidget />
      <WhatsAppButton />
    </div>
  );
};
