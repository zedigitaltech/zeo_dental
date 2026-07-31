import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { useScrollColorize } from '../hooks/useScrollColorize';
import { useLocalePath } from '../hooks/useLocalePath';
import { Header } from './Header';
import { Footer } from './Footer';
import { ChatWidget } from './ChatWidget';
import { WhatsAppButton } from './WhatsAppButton';

// Treatment data with images matching the homepage
const treatments = [
  {
    key: 'implantology',
    image: 'https://i.pinimg.com/originals/60/04/b9/6004b9521440d181bde0a734d93b7184.jpg',
    href: '/treatments/implantology',
  },
  {
    key: 'prosthetics',
    image: 'https://i.pinimg.com/originals/a1/30/09/a130095fbe716c5bb8e7be0713584fd0.jpg',
    href: '/treatments/prosthetics',
  },
  {
    key: 'aligners',
    image: 'https://i.pinimg.com/originals/5a/9e/4b/5a9e4b3d06cecb638556ece73cb0417c.jpg',
    href: '/treatments/aligners',
  },
  {
    key: 'orthodontics',
    image: 'https://i.pinimg.com/originals/d2/10/e6/d210e6d0cc27fca87fe4245aea34e071.jpg',
    href: '/treatments/orthodontics',
  },
  {
    key: 'crowns',
    image: 'https://i.pinimg.com/originals/3d/90/fd/3d90fd9c0112b18067d6348072116872.jpg',
    href: '/treatments/crowns',
  },
  {
    key: 'aesthetics',
    image: '/images/treatments/endodontics.jpg',
    href: '/treatments/endodontics',
  },
];

interface TreatmentCardProps {
  number: string;
  title: string;
  description: string;
  image: string;
  href: string;
  learnMoreText: string;
}

const TreatmentCard: React.FC<TreatmentCardProps> = ({
  number,
  title,
  description,
  image,
  href,
  learnMoreText,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [cardRef, shouldColorize] = useScrollColorize<HTMLAnchorElement>(0.4);

  return (
    <a
      ref={cardRef}
      href={href}
      className="group relative block aspect-[3/4] overflow-hidden bg-gray-100"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={image}
          alt={title}
          className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:grayscale-0 group-hover:scale-105 ${
            shouldColorize ? 'grayscale-0' : 'grayscale'
          } ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <span className="font-serif text-lg italic text-white/60 group-hover:text-studio-gold transition-colors duration-500">
            {number}
          </span>
          <div className="w-8 h-[1px] bg-white/30 group-hover:bg-studio-gold transition-colors duration-500 origin-right transform scale-x-50 group-hover:scale-x-100" />
        </div>

        {/* Bottom Content */}
        <div>
          <h3 className="font-serif text-2xl sm:text-3xl text-white mb-3 group-hover:translate-x-2 transition-transform duration-500">
            {title}
          </h3>
          <p className="text-sm text-white/70 leading-relaxed mb-4 opacity-80 group-hover:opacity-100 transition-opacity duration-500 line-clamp-3">
            {description}
          </p>
          <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-wider text-white/60 group-hover:text-studio-gold transition-colors duration-500">
            {learnMoreText}
            <ArrowRight className="w-3 h-3 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </a>
  );
};

export const TreatmentsOverview: React.FC = () => {
  const { t } = useTranslation();
  const lp = useLocalePath();

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16 sm:pt-40 sm:pb-20 bg-studio-black text-white">
        <div className="container mx-auto px-4 sm:px-6 md:px-12">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-[1px] w-8 bg-studio-gold" />
              <span className="text-studio-gold text-[11px] uppercase tracking-wider font-semibold">
                {t('treatments.label')}
              </span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1] mb-6">
              {t('treatments.title')}
            </h1>
            <p className="text-white/70 text-lg sm:text-xl leading-relaxed max-w-2xl">
              {t('treatments.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Treatments Grid */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 md:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {treatments.map((treatment, index) => (
              <TreatmentCard
                key={treatment.key}
                number={String(index + 1).padStart(2, '0')}
                title={t(`treatments.items.${treatment.key}.title`)}
                description={t(`treatments.items.${treatment.key}.description`)}
                image={treatment.image}
                href={lp(treatment.href)}
                learnMoreText={t('treatments.learnMore')}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 md:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="h-[1px] w-8 bg-studio-gold" />
              <span className="text-studio-gold text-[11px] uppercase tracking-wider font-semibold">
                {t('whyChooseUs.label')}
              </span>
              <span className="h-[1px] w-8 bg-studio-gold" />
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-studio-black mb-6">
              {t('whyChooseUs.title')}{' '}
              <span className="italic">{t('whyChooseUs.titleHighlight')}</span>
            </h2>
            <p className="text-studio-gray text-lg leading-relaxed mb-12">
              {t('whyChooseUs.subtitle')}
            </p>

            <div className="grid sm:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 border border-studio-gold rounded-full flex items-center justify-center">
                  <span className="text-studio-gold text-2xl font-serif">5★</span>
                </div>
                <h3 className="font-serif text-xl text-studio-black mb-2">
                  {t('whyChooseUs.feature1Title')}
                </h3>
                <p className="text-studio-gray text-sm">{t('whyChooseUs.feature1Desc')}</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 border border-studio-gold rounded-full flex items-center justify-center">
                  <span className="text-studio-gold text-2xl font-serif">3D</span>
                </div>
                <h3 className="font-serif text-xl text-studio-black mb-2">
                  {t('whyChooseUs.feature2Title')}
                </h3>
                <p className="text-studio-gray text-sm">{t('whyChooseUs.feature2Desc')}</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 border border-studio-gold rounded-full flex items-center justify-center">
                  <span className="text-studio-gold text-2xl font-serif">0</span>
                </div>
                <h3 className="font-serif text-xl text-studio-black mb-2">
                  {t('whyChooseUs.feature3Title')}
                </h3>
                <p className="text-studio-gray text-sm">{t('whyChooseUs.feature3Desc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Widgets */}
      <ChatWidget />
      <WhatsAppButton />
    </div>
  );
};

export default TreatmentsOverview;
