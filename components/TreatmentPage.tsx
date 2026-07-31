import React from 'react';
import { ArrowLeft, ArrowRight, Check, Clock, Shield } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { useLocalePath } from '../hooks/useLocalePath';
import { Header } from './Header';
import { Footer } from './Footer';
import { ChatWidget } from './ChatWidget';
import { WhatsAppButton } from './WhatsAppButton';

interface ProcessStep {
  title: string;
  description: string;
}

interface TreatmentPageProps {
  treatmentKey: string;
  heroImage: string;
}

export const TreatmentPage: React.FC<TreatmentPageProps> = ({ treatmentKey, heroImage }) => {
  const { t, tRaw } = useTranslation();
  const lp = useLocalePath();

  // Get treatment data from translations
  const title = t(`treatmentPages.${treatmentKey}.title`);
  const subtitle = t(`treatmentPages.${treatmentKey}.subtitle`);
  const heroDescription = t(`treatmentPages.${treatmentKey}.heroDescription`);
  const overview = t(`treatmentPages.${treatmentKey}.overview`);
  const benefits = tRaw<string[]>(`treatmentPages.${treatmentKey}.benefits`) || [];
  const process = tRaw<ProcessStep[]>(`treatmentPages.${treatmentKey}.process`) || [];
  const faqs =
    tRaw<{ question: string; answer: string }[]>(`treatmentPages.${treatmentKey}.faqs`) || [];
  const duration = t(`treatmentPages.${treatmentKey}.duration`);
  const warranty = t(`treatmentPages.${treatmentKey}.warranty`);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img src={heroImage} alt={title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
        </div>

        {/* Content */}
        <div className="relative container mx-auto px-4 sm:px-6 md:px-12 pt-32 pb-16">
          <a
            href={lp('/treatments')}
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-8 group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm uppercase tracking-wider">{t('services.backToServices')}</span>
          </a>

          <div className="max-w-3xl">
            <span className="text-studio-gold text-[11px] sm:text-[10px] uppercase tracking-wide sm:tracking-ultra mb-4 block font-semibold">
              {t('treatments.label')}
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white mb-6 leading-[1.1]">
              {title}
            </h1>
            <p className="text-white/80 text-lg sm:text-xl md:text-2xl font-light leading-relaxed mb-8">
              {subtitle}
            </p>
            <p className="text-white/60 text-base sm:text-lg leading-relaxed max-w-2xl">
              {heroDescription}
            </p>

            {/* Quick Info */}
            <div className="flex flex-wrap gap-6 mt-10">
              <div className="flex items-center gap-3 text-white/80">
                <Clock size={20} className="text-studio-gold" />
                <span className="text-sm">{duration}</span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <Shield size={20} className="text-studio-gold" />
                <span className="text-sm">{warranty}</span>
              </div>
            </div>

            {/* CTA */}
            <div className="mt-10">
              <a
                href={lp('/book')}
                className="inline-flex items-center gap-3 bg-studio-gold text-white px-8 py-4 text-sm uppercase tracking-wider hover:bg-studio-gold/90 transition-colors"
              >
                {t('services.bookAppointment')}
                <ArrowRight size={18} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Overview Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 md:px-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-[1px] w-8 bg-studio-gold"></span>
              <span className="text-studio-gold text-[11px] uppercase tracking-wide font-semibold">
                {t('services.overview')}
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-studio-black mb-8 leading-[1.1]">
              {t('services.aboutTreatment')}
            </h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-studio-gray text-lg leading-relaxed whitespace-pre-line">
                {overview}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 md:px-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-[1px] w-8 bg-studio-gold"></span>
              <span className="text-studio-gold text-[11px] uppercase tracking-wide font-semibold">
                {t('services.keyBenefits')}
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-studio-black mb-12 leading-[1.1]">
              {t(`treatmentPages.${treatmentKey}.benefitsTitle`)}
            </h2>

            <div className="grid sm:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-6 bg-white border border-gray-100 hover:border-studio-gold/30 transition-colors"
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-studio-gold/10 rounded-full flex items-center justify-center">
                    <Check size={16} className="text-studio-gold" />
                  </div>
                  <p className="text-studio-black">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 md:px-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <span className="h-[1px] w-8 bg-studio-gold"></span>
              <span className="text-studio-gold text-[11px] uppercase tracking-wide font-semibold">
                {t('services.theProcess')}
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-studio-black mb-12 leading-[1.1]">
              {t(`treatmentPages.${treatmentKey}.processTitle`)}
            </h2>

            <div className="space-y-0">
              {process.map((step, index) => (
                <div key={index} className="relative flex gap-6 pb-12 last:pb-0">
                  {/* Timeline line */}
                  {index < process.length - 1 && (
                    <div className="absolute left-[19px] top-10 w-[2px] h-[calc(100%-24px)] bg-gray-200" />
                  )}

                  {/* Step number */}
                  <div className="flex-shrink-0 w-10 h-10 bg-studio-black text-white rounded-full flex items-center justify-center font-serif text-lg relative z-10">
                    {index + 1}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <h3 className="font-serif text-xl sm:text-2xl text-studio-black mb-2">
                      {step.title}
                    </h3>
                    <p className="text-studio-gray leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      {faqs.length > 0 && (
        <section className="py-16 sm:py-24 bg-gray-50">
          <div className="container mx-auto px-4 sm:px-6 md:px-12">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-6">
                <span className="h-[1px] w-8 bg-studio-gold"></span>
                <span className="text-studio-gold text-[11px] uppercase tracking-wide font-semibold">
                  FAQ
                </span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl text-studio-black mb-12 leading-[1.1]">
                {t(`treatmentPages.${treatmentKey}.faqTitle`)}
              </h2>

              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <details
                    key={index}
                    className="group bg-white border border-gray-100 hover:border-studio-gold/30 transition-colors"
                  >
                    <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                      <h3 className="font-serif text-lg sm:text-xl text-studio-black pr-4">
                        {faq.question}
                      </h3>
                      <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-studio-gold transition-transform group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <div className="px-6 pb-6">
                      <p className="text-studio-gray leading-relaxed">{faq.answer}</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <Footer />

      {/* Widgets */}
      <ChatWidget />
      <WhatsAppButton />
    </div>
  );
};

export default TreatmentPage;
