import React, { useState, useEffect, useRef } from 'react';
import { Reveal } from './ui/Reveal';
import { DOCTORS } from '../constants';
import { useTranslation } from '../hooks/useTranslation';
import { useLocalePath } from '../hooks/useLocalePath';
import { sanitizeHtml } from '../utils/sanitize';

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

/**
 * Hook to detect when element is in view for mobile colorization (toggles on/off)
 */
function useScrollColorize(isMobile: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!isMobile || !ref.current) return;

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

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [isMobile]);

  return { ref, shouldColorize: isMobile ? isInView : false };
}

// Team member card with scroll colorization
interface TeamMemberCardProps {
  member: (typeof DOCTORS)[0];
  isMobile: boolean;
  t: (key: string) => string;
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ member, isMobile, t }) => {
  const colorize = useScrollColorize(isMobile);
  const lp = useLocalePath();

  const handleClick = () => {
    // Navigate to team page with member id hash
    window.location.href = lp('/team') + `#${member.id}`;
  };

  return (
    <div className="group cursor-pointer" onClick={handleClick}>
      <div ref={colorize.ref} className="aspect-[3/4] overflow-hidden relative bg-gray-100">
        {/* Image */}
        <picture>
          <source srcSet={member.image} type="image/webp" />
          <source srcSet={member.image.replace('.webp', '.jpg')} type="image/jpeg" />
          <img
            src={member.image.replace('.webp', '.jpg')}
            alt={member.name}
            className={`w-full h-full object-cover transition-all duration-[1.2s] ease-out group-hover:scale-[1.03] ${
              colorize.shouldColorize ? 'grayscale-0' : 'grayscale'
            } ${!isMobile ? 'group-hover:grayscale-0' : ''}`}
            style={
              member.id === 'dr-rien' || member.id === 'dr-kristi'
                ? { objectPosition: '7% center' }
                : member.id === 'dr-dorina'
                  ? { objectPosition: '35% center' }
                  : { objectPosition: 'center' }
            }
          />
        </picture>

        {/* Gradient overlay - always visible on mobile when in view, hover on desktop */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-700 ${
            colorize.shouldColorize ? 'opacity-100' : 'opacity-0'
          } ${!isMobile ? 'group-hover:opacity-100' : ''}`}
        />

        {/* Content overlay */}
        <div
          className={`absolute bottom-0 left-0 right-0 p-5 sm:p-6 md:p-8 transition-all duration-700 ${
            colorize.shouldColorize ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          } ${!isMobile ? 'group-hover:translate-y-0 group-hover:opacity-100' : ''}`}
        >
          <h3 className="font-serif text-xl sm:text-2xl md:text-3xl text-white mb-1 sm:mb-2">
            {member.name}
          </h3>
          <span className="text-white/80 text-[11px] sm:text-xs uppercase tracking-wide sm:tracking-wider font-light">
            {t(`team.doctors.${member.id}.role`)}
          </span>
        </div>

        {/* Subtle border frame */}
        <div
          className={`absolute inset-3 sm:inset-4 border border-white/0 transition-all duration-700 pointer-events-none ${
            colorize.shouldColorize ? 'border-white/20' : ''
          } ${!isMobile ? 'group-hover:border-white/20' : ''}`}
        />
      </div>
    </div>
  );
};

export const Team: React.FC = () => {
  const { t } = useTranslation();
  const lp = useLocalePath();
  const founder = DOCTORS[0];
  const team = DOCTORS.slice(1);
  const [isMobile, setIsMobile] = useState(false);
  const founderColorize = useScrollColorize(isMobile);

  // Detect touch device on mount
  useEffect(() => {
    setIsMobile(isTouchDevice());
  }, []);

  return (
    <section id="team" className="py-16 sm:py-24 md:py-32 bg-white relative">
      <div className="container mx-auto px-4 sm:px-6 md:px-12">
        {/* Founder Section */}
        <div className="flex flex-col lg:flex-row gap-8 sm:gap-12 lg:gap-16 items-center mb-16 sm:mb-24 md:mb-32 border-b border-gray-100 pb-12 sm:pb-16 md:pb-24">
          <div className="w-full lg:w-5/12">
            <Reveal>
              <a href={lp('/team') + '#dr-emanuela'} className="block">
                <div
                  ref={founderColorize.ref}
                  className="relative aspect-[3/4] overflow-hidden group cursor-pointer"
                >
                  <picture>
                    <source srcSet={founder.image} type="image/webp" />
                    <source srcSet={founder.image.replace('.webp', '.jpg')} type="image/jpeg" />
                    <img
                      src={founder.image.replace('.webp', '.jpg')}
                      alt={founder.name}
                      className={`w-full h-full object-cover object-center transition-all duration-[1.5s] ease-out group-hover:scale-[1.03] ${
                        founderColorize.shouldColorize ? 'grayscale-0' : 'grayscale'
                      } ${!isMobile ? 'group-hover:grayscale-0' : ''}`}
                    />
                  </picture>

                  {/* Gradient overlay - always visible on mobile when in view, hover on desktop */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-700 ${
                      founderColorize.shouldColorize ? 'opacity-100' : 'opacity-0'
                    } ${!isMobile ? 'group-hover:opacity-100' : ''}`}
                  />

                  {/* Content overlay */}
                  <div
                    className={`absolute bottom-0 left-0 right-0 p-6 sm:p-8 transition-all duration-700 ${
                      founderColorize.shouldColorize
                        ? 'translate-y-0 opacity-100'
                        : 'translate-y-4 opacity-0'
                    } ${!isMobile ? 'group-hover:translate-y-0 group-hover:opacity-100' : ''}`}
                  >
                    <span className="text-studio-gold text-[10px] sm:text-[11px] uppercase tracking-wider font-semibold mb-2 block">
                      {t('team.founderLabel')}
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl text-white mb-1 sm:mb-2">
                      {founder.name}
                    </h3>
                    <span className="text-white/80 text-[11px] sm:text-xs uppercase tracking-wider font-light">
                      {t(`team.doctors.${founder.id}.role`)}
                    </span>
                  </div>

                  {/* Subtle border frame */}
                  <div
                    className={`absolute inset-4 sm:inset-5 border border-white/0 transition-all duration-700 pointer-events-none ${
                      founderColorize.shouldColorize ? 'border-white/20' : ''
                    } ${!isMobile ? 'group-hover:border-white/20' : ''}`}
                  />
                </div>
              </a>
            </Reveal>
          </div>
          <div className="w-full lg:w-7/12 lg:pl-12">
            <Reveal delay={200}>
              <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                <span className="h-[1px] w-6 sm:w-8 bg-studio-gold"></span>
                <span className="text-studio-gold text-[11px] sm:text-[10px] uppercase tracking-wide sm:tracking-ultra font-semibold">
                  {t('team.founderLabel')}
                </span>
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-7xl text-studio-black mb-4 sm:mb-6 md:mb-8 leading-[0.9]">
                {founder.name}
              </h2>

              <p className="font-serif text-base sm:text-lg md:text-xl lg:text-2xl text-studio-black mb-6 sm:mb-8 md:mb-10 leading-relaxed opacity-80 max-w-2xl [&_strong]:font-bold [&_strong]:text-studio-black">
                {sanitizeHtml(t(`team.doctors.${founder.id}.bio`))}
              </p>

              <div className="flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-8 lg:gap-16">
                <div>
                  <span className="text-[11px] sm:text-[10px] text-studio-gray uppercase tracking-wide sm:tracking-ultra block mb-2">
                    {t('team.education')}
                  </span>
                  <div className="font-serif text-sm sm:text-base md:text-lg space-y-1">
                    <p>{t(`team.doctors.${founder.id}.education1`)}</p>
                    <p>{t(`team.doctors.${founder.id}.education2`)}</p>
                    <p>{t(`team.doctors.${founder.id}.education3`)}</p>
                  </div>
                </div>
                <div>
                  <span className="text-[11px] sm:text-[10px] text-studio-gray uppercase tracking-wide sm:tracking-ultra block mb-2">
                    {t('team.memberships')}
                  </span>
                  <div className="font-serif text-sm sm:text-base md:text-lg space-y-1">
                    <p>{t(`team.doctors.${founder.id}.membership1`)}</p>
                    <p>{t(`team.doctors.${founder.id}.membership2`)}</p>
                    <p>{t(`team.doctors.${founder.id}.membership3`)}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 sm:mt-10 md:mt-12 pt-6 sm:pt-8 border-t border-gray-100">
                <p className="font-serif italic text-studio-gray text-base sm:text-lg">
                  &ldquo;{t(`team.doctors.${founder.id}.quote`)}&rdquo;
                </p>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Team Grid */}
        <div>
          <Reveal>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 sm:mb-10 md:mb-12 lg:mb-16 gap-3 sm:gap-4">
              <h3 className="font-serif text-xl sm:text-2xl md:text-3xl text-studio-black">
                {t('team.teamTitle')}
              </h3>
              <span className="text-[11px] sm:text-[10px] uppercase tracking-wide sm:tracking-ultra text-studio-gray">
                {t('team.teamSubtitle')}
              </span>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {team.map((member, idx) => (
              <Reveal key={member.id} delay={idx * 100}>
                {/* Slide Dr. Dorina to the right on md screens (when 2-col grid) */}
                <div>
                  <TeamMemberCard member={member} isMobile={isMobile} t={t} />
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
