import React from 'react';
import { ArrowLeft, ArrowRight, Clock, Layers } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { useLocalePath } from '../hooks/useLocalePath';
import { Header } from './Header';
import { Footer } from './Footer';
import { ChatWidget } from './ChatWidget';
import { WhatsAppButton } from './WhatsAppButton';
import { ComparisonSlider } from './ComparisonSlider';

interface CaseData {
  number: string;
  title: string;
  description: string;
  beforeImage: string;
  afterImage: string;
  beforePosition?: string;
  afterPosition?: string;
  details: { label: string; value: string }[];
}

export const ClinicalCasesPage: React.FC = () => {
  const { t } = useTranslation();
  const lp = useLocalePath();

  // Case data - all 3 cases
  const cases: CaseData[] = [
    {
      number: t('cases.case1.number'),
      title: t('cases.case1.title'),
      description: t('cases.case1.description'),
      beforeImage: '/images/cases/case1-before.jpg',
      afterImage: '/images/cases/case1-after.jpg',
      details: [
        { label: t('cases.case1.detail1Label'), value: t('cases.case1.detail1Value') },
        { label: t('cases.case1.detail2Label'), value: t('cases.case1.detail2Value') },
      ],
    },
    {
      number: t('cases.case2.number'),
      title: t('cases.case2.title'),
      description: t('cases.case2.description'),
      beforeImage: '/images/cases/case2-before.jpg',
      afterImage: '/images/cases/case2-after.jpg',
      beforePosition: 'center 45%',
      afterPosition: 'center 40%',
      details: [
        { label: t('cases.case2.detail1Label'), value: t('cases.case2.detail1Value') },
        { label: t('cases.case2.detail2Label'), value: t('cases.case2.detail2Value') },
      ],
    },
    {
      number: t('cases.case3.number'),
      title: t('cases.case3.title'),
      description: t('cases.case3.description'),
      beforeImage: '/images/cases/case3-before.jpg',
      afterImage: '/images/cases/case3-after.jpg',
      beforePosition: 'center 40%',
      afterPosition: 'center 45%',
      details: [
        { label: t('cases.case3.detail1Label'), value: t('cases.case3.detail1Value') },
        { label: t('cases.case3.detail2Label'), value: t('cases.case3.detail2Value') },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center bg-studio-black">
        <div className="absolute inset-0 bg-gradient-to-b from-studio-black to-studio-black/95" />

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
              {t('cases.label')}
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white mb-6 leading-[1.1]">
              {t('casesPage.title')}
            </h1>
            <p className="text-white/70 text-lg sm:text-xl md:text-2xl leading-relaxed max-w-3xl">
              {t('casesPage.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 md:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <span className="h-[1px] w-8 bg-studio-gold" />
              <span className="text-studio-gold text-[11px] uppercase tracking-wide font-semibold">
                {t('casesPage.introLabel')}
              </span>
              <span className="h-[1px] w-8 bg-studio-gold" />
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-studio-black mb-6">
              {t('casesPage.introTitle')}
            </h2>
            <p className="text-studio-gray text-lg leading-relaxed">{t('casesPage.introText')}</p>
          </div>
        </div>
      </section>

      {/* Cases Gallery */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 md:px-12">
          <div className="flex items-center gap-3 mb-12">
            <span className="h-[1px] w-8 bg-studio-gold" />
            <span className="text-studio-gold text-[11px] uppercase tracking-wide font-semibold">
              {t('cases.title')}
            </span>
          </div>

          {/* Case Cards */}
          <div className="space-y-16">
            {cases.map((caseItem, index) => (
              <div key={index} className="bg-white border border-gray-100 overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                  {/* Comparison Slider */}
                  <div className="w-full lg:w-1/2 aspect-[4/3] lg:aspect-auto relative">
                    <ComparisonSlider
                      beforeImage={caseItem.beforeImage}
                      afterImage={caseItem.afterImage}
                      beforePosition={caseItem.beforePosition}
                      afterPosition={caseItem.afterPosition}
                    />
                  </div>

                  {/* Content */}
                  <div className="w-full lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
                    <span className="text-studio-gold text-xs font-semibold uppercase tracking-wider mb-4">
                      {caseItem.number}
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl text-studio-black mb-4">
                      {caseItem.title}
                    </h3>
                    <p className="text-studio-gray leading-relaxed mb-8">{caseItem.description}</p>

                    {/* Details */}
                    <div className="flex gap-8 border-t border-gray-100 pt-6">
                      {caseItem.details.map((detail, detailIndex) => (
                        <div key={detailIndex} className="flex items-center gap-3">
                          {detailIndex === 0 ? (
                            <Clock size={18} className="text-studio-gold" />
                          ) : (
                            <Layers size={18} className="text-studio-gold" />
                          )}
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-studio-gray">
                              {detail.label}
                            </p>
                            <p className="font-serif text-studio-black">{detail.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 md:px-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-3 mb-6">
                <span className="h-[1px] w-8 bg-studio-gold" />
                <span className="text-studio-gold text-[11px] uppercase tracking-wide font-semibold">
                  {t('casesPage.processLabel')}
                </span>
                <span className="h-[1px] w-8 bg-studio-gold" />
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl text-studio-black mb-6">
                {t('casesPage.processTitle')}
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-studio-black text-white rounded-full flex items-center justify-center font-serif text-2xl">
                  1
                </div>
                <h3 className="font-serif text-xl text-studio-black mb-3">
                  {t('casesPage.step1Title')}
                </h3>
                <p className="text-studio-gray text-sm leading-relaxed">
                  {t('casesPage.step1Desc')}
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-studio-black text-white rounded-full flex items-center justify-center font-serif text-2xl">
                  2
                </div>
                <h3 className="font-serif text-xl text-studio-black mb-3">
                  {t('casesPage.step2Title')}
                </h3>
                <p className="text-studio-gray text-sm leading-relaxed">
                  {t('casesPage.step2Desc')}
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-studio-black text-white rounded-full flex items-center justify-center font-serif text-2xl">
                  3
                </div>
                <h3 className="font-serif text-xl text-studio-black mb-3">
                  {t('casesPage.step3Title')}
                </h3>
                <p className="text-studio-gray text-sm leading-relaxed">
                  {t('casesPage.step3Desc')}
                </p>
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

export default ClinicalCasesPage;
