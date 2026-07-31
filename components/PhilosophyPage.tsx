import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, Heart, Shield, Sparkles, Users } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { useScrollColorize } from '../hooks/useScrollColorize';
import { useLocalePath } from '../hooks/useLocalePath';
import { Header } from './Header';
import { Footer } from './Footer';
import { ChatWidget } from './ChatWidget';
import { WhatsAppButton } from './WhatsAppButton';

// Philosophy section images - clinic and team photos
const philosophyImages = [
  { src: '/images/philosophy/dorina-office.jpg', alt: 'Dr. Dorina at the clinic' },
  { src: '/images/philosophy/kristi-office.jpg', alt: 'Dr. Kristi at the clinic' },
  { src: '/images/philosophy/rieni-office.jpg', alt: 'Dr. Rieni at the clinic' },
  { src: '/images/philosophy/rieni-office-2.jpg', alt: 'Dr. Rieni consultation' },
  { src: '/images/philosophy/emanuela-office.jpg', alt: 'Dr. Emanuela at the clinic' },
  { src: '/images/philosophy/emanuela-office-2.jpg', alt: 'Dr. Emanuela consultation' },
  { src: '/images/philosophy/dorina-tools.jpg', alt: 'Dental tools closeup' },
  { src: '/images/philosophy/sterilisation-room.jpg', alt: 'Sterilisation room' },
];

export const PhilosophyPage: React.FC = () => {
  const { t } = useTranslation();
  const lp = useLocalePath();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slideshowRef, shouldColorize] = useScrollColorize<HTMLDivElement>(0.4);

  // Preload images
  useEffect(() => {
    philosophyImages.forEach(img => {
      const image = new Image();
      image.src = img.src;
    });
  }, []);

  // Auto-rotate images
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentImageIndex(prev => (prev + 1) % philosophyImages.length);
        setIsTransitioning(false);
      }, 500);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center bg-studio-black overflow-hidden">
        {/* Background Image Grid */}
        <div className="absolute inset-0 opacity-20">
          <div className="grid grid-cols-4 h-full">
            {philosophyImages.slice(0, 4).map((img, i) => (
              <div key={i} className="relative overflow-hidden">
                <img src={img.src} alt="" className="w-full h-full object-cover grayscale" />
              </div>
            ))}
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-studio-black via-studio-black/90 to-studio-black" />

        {/* Content */}
        <div className="relative container mx-auto px-4 sm:px-6 md:px-12 pt-32 pb-16">
          <a
            href={lp('/')}
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8 group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm uppercase tracking-wider">{t('services.backToServices')}</span>
          </a>

          <div className="max-w-4xl">
            <span className="text-studio-gold text-[11px] sm:text-[10px] uppercase tracking-wide sm:tracking-ultra mb-4 block font-semibold">
              {t('philosophy.label')}
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white mb-6 leading-[1.1]">
              {t('philosophyPage.title')}
            </h1>
            <p className="text-white/70 text-lg sm:text-xl md:text-2xl leading-relaxed max-w-3xl">
              {t('philosophyPage.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Main Philosophy Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 md:px-12">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
            {/* Image Slideshow */}
            <div className="w-full lg:w-5/12">
              <div className="lg:sticky lg:top-32">
                <div
                  ref={slideshowRef}
                  className="relative aspect-[3/4] w-full overflow-hidden bg-gray-100 group/philosophy"
                >
                  {philosophyImages.map((img, index) => (
                    <img
                      key={img.src}
                      src={img.src}
                      alt={img.alt}
                      className={`absolute inset-0 object-cover w-full h-full transition-all duration-1000 ease-in-out group-hover/philosophy:grayscale-0 ${
                        shouldColorize ? 'grayscale-0' : 'grayscale'
                      } ${
                        index === currentImageIndex && !isTransitioning
                          ? 'opacity-100'
                          : 'opacity-0'
                      }`}
                      style={{ zIndex: index === currentImageIndex ? 10 : 1 }}
                    />
                  ))}

                  {/* Image indicators */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20">
                    {philosophyImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setIsTransitioning(true);
                          setTimeout(() => {
                            setCurrentImageIndex(index);
                            setIsTransitioning(false);
                          }, 500);
                        }}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${
                          index === currentImageIndex
                            ? 'bg-white w-6'
                            : 'bg-white/50 hover:bg-white/75'
                        }`}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>

                  {/* Quote overlay */}
                  <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 p-4 sm:p-6 bg-white/90 backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity duration-500 z-20">
                    <p className="font-serif italic text-base sm:text-lg text-studio-black">
                      &ldquo;{t('philosophy.quote')}&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="w-full lg:w-7/12">
              <div className="space-y-12">
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="h-[1px] w-8 bg-studio-gold" />
                    <span className="text-studio-gold text-[11px] uppercase tracking-wide font-semibold">
                      {t('philosophyPage.visionLabel')}
                    </span>
                  </div>
                  <h2 className="font-serif text-3xl sm:text-4xl text-studio-black mb-6 leading-[1.1]">
                    {t('philosophyPage.visionTitle')}
                  </h2>
                  <p className="text-studio-gray text-lg leading-relaxed">
                    {t('philosophyPage.visionText')}
                  </p>
                </div>

                <div className="border-l-2 border-studio-gold pl-8">
                  <p className="font-serif text-2xl sm:text-3xl text-studio-black leading-relaxed">
                    {t('philosophy.text1')}
                  </p>
                </div>

                <div>
                  <p className="font-serif text-2xl sm:text-3xl text-studio-black leading-relaxed">
                    {t('philosophy.text2')}
                  </p>
                </div>

                {/* Expertise & Technology */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-100">
                  <div>
                    <h4 className="font-sans text-[11px] uppercase tracking-ultra text-studio-gray mb-4">
                      {t('philosophy.expertise')}
                    </h4>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3">
                        <Check size={16} className="text-studio-gold flex-shrink-0" />
                        <span className="font-serif text-lg">
                          {t('philosophy.expertiseList.item1')}
                        </span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check size={16} className="text-studio-gold flex-shrink-0" />
                        <span className="font-serif text-lg">
                          {t('philosophy.expertiseList.item2')}
                        </span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check size={16} className="text-studio-gold flex-shrink-0" />
                        <span className="font-serif text-lg">
                          {t('philosophy.expertiseList.item3')}
                        </span>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-sans text-[11px] uppercase tracking-ultra text-studio-gray mb-4">
                      {t('philosophy.technology')}
                    </h4>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3">
                        <Check size={16} className="text-studio-gold flex-shrink-0" />
                        <span className="font-serif text-lg">
                          {t('philosophy.technologyList.item1')}
                        </span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check size={16} className="text-studio-gold flex-shrink-0" />
                        <span className="font-serif text-lg">
                          {t('philosophy.technologyList.item2')}
                        </span>
                      </li>
                      <li className="flex items-center gap-3">
                        <Check size={16} className="text-studio-gold flex-shrink-0" />
                        <span className="font-serif text-lg">
                          {t('philosophy.technologyList.item3')}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 md:px-12">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="h-[1px] w-8 bg-studio-gold" />
              <span className="text-studio-gold text-[11px] uppercase tracking-wide font-semibold">
                {t('philosophyPage.valuesLabel')}
              </span>
              <span className="h-[1px] w-8 bg-studio-gold" />
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-studio-black mb-6">
              {t('philosophyPage.valuesTitle')}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 border border-gray-100 hover:border-studio-gold/30 transition-colors text-center">
              <div className="w-16 h-16 mx-auto mb-6 border border-studio-gold rounded-full flex items-center justify-center">
                <Sparkles className="text-studio-gold" size={24} />
              </div>
              <h3 className="font-serif text-xl text-studio-black mb-3">
                {t('services.excellence.title')}
              </h3>
              <p className="text-studio-gray text-sm leading-relaxed">
                {t('services.excellence.description')}
              </p>
            </div>

            <div className="bg-white p-8 border border-gray-100 hover:border-studio-gold/30 transition-colors text-center">
              <div className="w-16 h-16 mx-auto mb-6 border border-studio-gold rounded-full flex items-center justify-center">
                <Users className="text-studio-gold" size={24} />
              </div>
              <h3 className="font-serif text-xl text-studio-black mb-3">
                {t('services.personalization.title')}
              </h3>
              <p className="text-studio-gray text-sm leading-relaxed">
                {t('services.personalization.description')}
              </p>
            </div>

            <div className="bg-white p-8 border border-gray-100 hover:border-studio-gold/30 transition-colors text-center">
              <div className="w-16 h-16 mx-auto mb-6 border border-studio-gold rounded-full flex items-center justify-center">
                <Heart className="text-studio-gold" size={24} />
              </div>
              <h3 className="font-serif text-xl text-studio-black mb-3">
                {t('services.comfort.title')}
              </h3>
              <p className="text-studio-gray text-sm leading-relaxed">
                {t('services.comfort.description')}
              </p>
            </div>

            <div className="bg-white p-8 border border-gray-100 hover:border-studio-gold/30 transition-colors text-center">
              <div className="w-16 h-16 mx-auto mb-6 border border-studio-gold rounded-full flex items-center justify-center">
                <Shield className="text-studio-gold" size={24} />
              </div>
              <h3 className="font-serif text-xl text-studio-black mb-3">
                {t('services.privacy.title')}
              </h3>
              <p className="text-studio-gray text-sm leading-relaxed">
                {t('services.privacy.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 md:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="h-[1px] w-8 bg-studio-gold" />
              <span className="text-studio-gold text-[11px] uppercase tracking-wide font-semibold">
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

export default PhilosophyPage;
