import React, { useState, useEffect } from 'react';
import { Reveal } from './ui/Reveal';
import { TextReveal } from './ui/TextReveal';
import { useTranslation } from '../hooks/useTranslation';

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

export const Philosophy: React.FC = () => {
  const { t } = useTranslation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>(
    new Array(philosophyImages.length).fill(false)
  );
  const [isMobile, setIsMobile] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imageContainerRef = React.useRef<HTMLDivElement>(null);

  // Detect touch device on mount
  useEffect(() => {
    setIsMobile(isTouchDevice());
  }, []);

  // On mobile: detect when image is in view to colorize (toggles on/off)
  useEffect(() => {
    if (!isMobile || !imageContainerRef.current) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          // Toggle based on visibility - colorize when in view, grayscale when not
          setIsInView(entry.isIntersecting);
        });
      },
      {
        rootMargin: '-20% 0px -20% 0px',
        threshold: 0.3,
      }
    );

    observer.observe(imageContainerRef.current);
    return () => observer.disconnect();
  }, [isMobile]);

  // Determine if image should be colorized
  const shouldColorize = isMobile ? isInView : false;

  // Preload all images
  useEffect(() => {
    philosophyImages.forEach((img, index) => {
      const image = new Image();
      image.src = img.src;
      image.onload = () => {
        setImagesLoaded(prev => {
          const newState = [...prev];
          newState[index] = true;
          return newState;
        });
      };
    });
  }, []);

  // Auto-rotate images with fade effect
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);

      // Wait for fade out, then change image
      setTimeout(() => {
        setCurrentImageIndex(prev => (prev + 1) % philosophyImages.length);
        setIsTransitioning(false);
      }, 500); // Half of the transition duration
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="philosophy" className="py-16 sm:py-24 md:py-32 lg:py-48 bg-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 md:px-12">
        <div className="flex flex-col lg:flex-row gap-12 sm:gap-16 lg:gap-32">
          {/* Left: Sticky Image Slideshow */}
          <div className="w-full lg:w-5/12">
            <div className="lg:sticky lg:top-32">
              <Reveal>
                <span className="text-studio-gold text-[11px] sm:text-[10px] uppercase tracking-wide sm:tracking-ultra mb-4 sm:mb-6 block font-semibold">
                  {t('philosophy.label')}
                </span>
                <div
                  ref={imageContainerRef}
                  className="relative aspect-[3/4] w-full overflow-hidden mb-6 sm:mb-8 bg-gray-100 group/philosophy"
                >
                  {/* Image container with fade animation */}
                  <div className="absolute inset-0">
                    {philosophyImages.map((img, index) => (
                      <img
                        key={img.src}
                        src={img.src}
                        alt={img.alt}
                        className={`absolute inset-0 object-cover w-full h-full transition-all duration-1000 ease-in-out ${
                          shouldColorize ? 'grayscale-0' : 'grayscale'
                        } ${!isMobile ? 'group-hover/philosophy:grayscale-0' : ''} ${
                          index === currentImageIndex && !isTransitioning
                            ? 'opacity-100'
                            : 'opacity-0'
                        }`}
                        style={{
                          zIndex: index === currentImageIndex ? 10 : 1,
                        }}
                      />
                    ))}
                  </div>

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

                  {/* Overlay with quote on hover */}
                  <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 right-4 sm:right-6 p-4 sm:p-6 bg-white/90 backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity duration-500 z-20">
                    <p className="font-serif italic text-base sm:text-lg text-studio-black">
                      &ldquo;{t('philosophy.quote')}&rdquo;
                    </p>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>

          {/* Right: Scrolling Text */}
          <div className="w-full lg:w-7/12 flex flex-col justify-center">
            <div className="font-serif text-2xl sm:text-3xl md:text-5xl lg:text-6xl leading-[1.2] text-studio-black space-y-12 sm:space-y-16 md:space-y-24">
              <div className="border-l border-studio-gold pl-6 sm:pl-8 md:pl-12">
                <TextReveal>{t('philosophy.text1')}</TextReveal>
              </div>

              <div className="pl-6 sm:pl-8 md:pl-12">
                <TextReveal>{t('philosophy.text2')}</TextReveal>
              </div>

              <div className="pl-6 sm:pl-8 md:pl-12 pt-8 sm:pt-12">
                <Reveal delay={200}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 border-t border-gray-100 pt-8 sm:pt-12">
                    <div>
                      <h4 className="font-sans text-[11px] sm:text-[10px] uppercase tracking-wide sm:tracking-ultra text-studio-gray mb-3">
                        {t('philosophy.expertise')}
                      </h4>
                      <ul className="space-y-2 font-serif text-base sm:text-lg md:text-xl">
                        <li>{t('philosophy.expertiseList.item1')}</li>
                        <li>{t('philosophy.expertiseList.item2')}</li>
                        <li>{t('philosophy.expertiseList.item3')}</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-sans text-[11px] sm:text-[10px] uppercase tracking-wide sm:tracking-ultra text-studio-gray mb-3">
                        {t('philosophy.technology')}
                      </h4>
                      <ul className="space-y-2 font-serif text-base sm:text-lg md:text-xl">
                        <li>{t('philosophy.technologyList.item1')}</li>
                        <li>{t('philosophy.technologyList.item2')}</li>
                        <li>{t('philosophy.technologyList.item3')}</li>
                      </ul>
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
