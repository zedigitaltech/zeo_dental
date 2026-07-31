import React, { useState, useEffect, useRef } from 'react';
import { ComparisonSlider } from './ComparisonSlider';
import { Reveal } from './ui/Reveal';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { useLocalePath } from '../hooks/useLocalePath';

/**
 * Detect if device is touch-only (no hover capability)
 */
function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const cannotHover = window.matchMedia('(hover: none)').matches;
  const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const hasTouchCapability = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const mobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  return cannotHover || hasCoarsePointer || (mobileUserAgent && hasTouchCapability);
}

interface CaseDetail {
  label: string;
  value: string;
}

interface CaseCardProps {
  number: string;
  title: string;
  description: string;
  beforeImage: string;
  afterImage: string;
  beforePosition?: string;
  afterPosition?: string;
  details: CaseDetail[];
}

const CaseCard: React.FC<CaseCardProps> = ({
  number,
  title,
  description,
  beforeImage,
  afterImage,
  beforePosition,
  afterPosition,
  details,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Detect touch device on mount
  useEffect(() => {
    setIsMobile(isTouchDevice());
  }, []);

  // On mobile: detect when card is in view to show description
  useEffect(() => {
    if (!isMobile || !cardRef.current) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          setIsActive(entry.isIntersecting);
        });
      },
      {
        rootMargin: '-20% 0px -20% 0px',
        threshold: 0.5,
      }
    );

    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [isMobile]);

  // Classes for mobile active state (simulates hover)
  const isExpanded = isMobile && isActive;

  return (
    <div
      ref={cardRef}
      className={`group/case relative w-full aspect-[3/4] bg-white overflow-hidden shadow-sm transition-all duration-700 ease-[0.22,1,0.36,1] cursor-pointer ${
        isExpanded ? 'shadow-2xl' : 'hover:shadow-2xl'
      }`}
    >
      {/*
                Image Container
                - Initially: inset-0 (Full cover)
                - Hover/Active: Top 24px, Left 24px, Right 24px, Height 50%
                This creates a 'frame' effect where the image shrinks and centers at the top
            */}
      <div
        className={`absolute transition-all duration-[800ms] cubic-bezier(0.22, 1, 0.36, 1)
                z-20 overflow-hidden bg-gray-100
                ${
                  isExpanded
                    ? 'h-[55%] w-[90%] top-[6%] left-[5%] shadow-lg'
                    : 'top-0 left-0 right-0 h-full w-full shadow-none group-hover/case:h-[55%] group-hover/case:w-[90%] group-hover/case:top-[6%] group-hover/case:left-[5%] group-hover/case:shadow-lg'
                }`}
      >
        <ComparisonSlider
          beforeImage={beforeImage}
          afterImage={afterImage}
          beforePosition={beforePosition}
          afterPosition={afterPosition}
        />

        {/* Number Badge - Always visible on image, moves with it */}
        <div
          className={`absolute top-4 left-4 z-30 transition-opacity duration-300 ${
            isExpanded ? 'opacity-0' : 'opacity-100 group-hover/case:opacity-0'
          }`}
        >
          <span className="bg-black/20 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-ultra px-3 py-1 border border-white/20">
            {number}
          </span>
        </div>
      </div>

      {/*
                Text Content
                - Sits at the bottom
                - Initially hidden and pushed down
            */}
      <div
        style={isExpanded ? { opacity: 1, transform: 'translateY(0)' } : undefined}
        className={`absolute bottom-0 left-0 w-full h-[45%] z-10 flex flex-col items-center justify-center px-4 sm:px-8 text-center
                transition-all duration-[800ms] cubic-bezier(0.22, 1, 0.36, 1) delay-100
                ${
                  isExpanded
                    ? ''
                    : 'opacity-0 translate-y-8 group-hover/case:opacity-100 group-hover/case:translate-y-0'
                }`}
      >
        <span className="text-[10px] font-bold text-studio-gold uppercase tracking-ultra mb-2 sm:mb-4">
          {number}
        </span>
        <h3 className="font-serif text-xl sm:text-2xl text-studio-black mb-2 sm:mb-4">{title}</h3>
        <p className="text-[11px] sm:text-xs text-studio-gray font-light leading-relaxed mb-3 sm:mb-6 line-clamp-2 sm:line-clamp-3 max-w-[95%] sm:max-w-[90%]">
          {description}
        </p>

        <div className="flex gap-4 sm:gap-8 border-t border-gray-100 pt-3 sm:pt-5 justify-center w-full">
          {details.map((detail, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <p className="text-[8px] sm:text-[9px] uppercase tracking-ultra text-gray-400 mb-1">
                {detail.label}
              </p>
              <p className="font-serif text-studio-black text-xs sm:text-sm">{detail.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ClinicalCases: React.FC = () => {
  const { t } = useTranslation();
  const lp = useLocalePath();

  return (
    <section
      id="cases"
      className="py-16 sm:py-24 md:py-32 bg-[#FAFAFA] border-t border-gray-100 relative"
    >
      <div className="container mx-auto px-4 sm:px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 sm:mb-16 md:mb-24 gap-4 sm:gap-6">
          <Reveal>
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <span className="h-[1px] w-6 sm:w-8 bg-studio-gold"></span>
              <span className="text-studio-gold text-[11px] sm:text-[10px] uppercase tracking-wide sm:tracking-ultra font-semibold">
                {t('cases.label')}
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-7xl text-studio-black">
              {t('cases.title')}
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <a
              href={lp('/cases')}
              className="group hidden md:flex items-center gap-4 text-[10px] uppercase tracking-ultra hover:text-studio-gold transition-colors py-2"
              data-cursor="hover"
            >
              {t('cases.viewGallery')}
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-2 transition-transform" />
            </a>
          </Reveal>
        </div>

        {/* Cases Grid - 3 columns on desktop, 1 on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          <Reveal delay={0}>
            <CaseCard
              number={t('cases.case1.number')}
              title={t('cases.case1.title')}
              description={t('cases.case1.description')}
              beforeImage="/images/cases/case1-before.jpg"
              afterImage="/images/cases/case1-after.jpg"
              details={[
                { label: t('cases.case1.detail1Label'), value: t('cases.case1.detail1Value') },
                { label: t('cases.case1.detail2Label'), value: t('cases.case1.detail2Value') },
              ]}
            />
          </Reveal>
          <Reveal delay={100}>
            <CaseCard
              number={t('cases.case2.number')}
              title={t('cases.case2.title')}
              description={t('cases.case2.description')}
              beforeImage="/images/cases/case2-before.jpg"
              afterImage="/images/cases/case2-after.jpg"
              beforePosition="center 45%"
              afterPosition="center 40%"
              details={[
                { label: t('cases.case2.detail1Label'), value: t('cases.case2.detail1Value') },
                { label: t('cases.case2.detail2Label'), value: t('cases.case2.detail2Value') },
              ]}
            />
          </Reveal>
          <Reveal delay={200}>
            <CaseCard
              number={t('cases.case3.number')}
              title={t('cases.case3.title')}
              description={t('cases.case3.description')}
              beforeImage="/images/cases/case3-before.jpg"
              afterImage="/images/cases/case3-after.jpg"
              beforePosition="center 40%"
              afterPosition="center 45%"
              details={[
                { label: t('cases.case3.detail1Label'), value: t('cases.case3.detail1Value') },
                { label: t('cases.case3.detail2Label'), value: t('cases.case3.detail2Value') },
              ]}
            />
          </Reveal>
        </div>

        {/* Mobile-only CTA since the top one is hidden on mobile */}
        <div className="mt-8 sm:mt-10 md:mt-12 md:hidden flex justify-center">
          <a
            href={lp('/cases')}
            className="group flex items-center gap-3 sm:gap-4 text-[11px] sm:text-[10px] uppercase tracking-wide sm:tracking-ultra hover:text-studio-gold transition-colors py-3 px-4"
          >
            {t('cases.viewGallery')}
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-2 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
};
