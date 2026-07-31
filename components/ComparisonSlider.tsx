import React, { useState, useRef, useEffect } from 'react';

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

interface ComparisonSliderProps {
  beforeImage: string;
  afterImage: string;
  beforePosition?: string; // e.g., "center 40%" to adjust vertical position
  afterPosition?: string; // e.g., "center 60%" to adjust vertical position
}

export const ComparisonSlider: React.FC<ComparisonSliderProps> = ({
  beforeImage,
  afterImage,
  beforePosition = 'center center',
  afterPosition = 'center center',
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isResizing, setIsResizing] = useState(false);
  const [containerWidth, setContainerWidth] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Detect touch device on mount
  useEffect(() => {
    setIsMobile(isTouchDevice());
  }, []);

  // On mobile: detect when slider is in view to colorize (toggles on/off)
  useEffect(() => {
    if (!isMobile || !containerRef.current) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          // Toggle based on visibility - colorize when in view, grayscale when not
          setIsInView(entry.isIntersecting);
        });
      },
      {
        rootMargin: '-15% 0px -15% 0px',
        threshold: 0.5,
      }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isMobile]);

  // Determine if images should be colorized (in view OR being interacted with)
  const shouldColorize = isMobile ? isInView || isResizing : false;

  // Show labels when interacting (touching/dragging) on mobile, or in view on desktop
  const showLabels = isMobile ? isInView || isResizing : false;

  const handleMouseDown = () => setIsResizing(true);
  const handleMouseUp = () => setIsResizing(false);

  const handleMouseMove = (event: React.MouseEvent | MouseEvent) => {
    if (!isResizing || !containerRef.current) return;

    const { left, width } = containerRef.current.getBoundingClientRect();
    const position = event.clientX - left;
    const percentage = Math.max(0, Math.min(100, (position / width) * 100));

    setSliderPosition(percentage);
  };

  const handleTouchMove = (event: React.TouchEvent | TouchEvent) => {
    if (!containerRef.current) return;
    const { left, width } = containerRef.current.getBoundingClientRect();
    const position = event.touches[0].clientX - left;
    const percentage = Math.max(0, Math.min(100, (position / width) * 100));
    setSliderPosition(percentage);
  };

  useEffect(() => {
    const handleUp = () => setIsResizing(false);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchend', handleUp);
    return () => {
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchend', handleUp);
    };
  }, []);

  // Use ResizeObserver to keep the inner image from squashing
  useEffect(() => {
    if (!containerRef.current) return;

    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      className="relative w-full h-full overflow-hidden cursor-ew-resize select-none group bg-gray-100"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onMouseDown={handleMouseDown}
      onTouchStart={handleMouseDown}
      data-cursor="hover"
    >
      {/* After Image (Background Layer - Right Side) */}
      <img
        src={afterImage}
        alt="After"
        className={`absolute top-0 left-0 w-full h-full object-cover pointer-events-none select-none transition-all duration-[1.5s] ease-out ${
          shouldColorize ? 'grayscale-0' : 'grayscale'
        } ${!isMobile ? 'group-hover:grayscale-0 group-hover/case:grayscale-0' : ''}`}
        style={{ objectPosition: afterPosition }}
        draggable={false}
      />

      {/* Before Image (Foreground Layer - Clipped Left Side) */}
      <div
        className="absolute top-0 left-0 h-full overflow-hidden pointer-events-none border-r border-white/50 z-20"
        style={{ width: `${sliderPosition}%` }}
      >
        {/* Inner Wrapper: Matches full container width to prevent squashing */}
        <div
          className="relative h-full"
          style={{ width: containerWidth ? `${containerWidth}px` : '100vw' }}
        >
          <img
            src={beforeImage}
            alt="Before"
            className={`absolute top-0 left-0 w-full h-full object-cover select-none transition-all duration-[1.5s] ease-out ${
              shouldColorize ? 'grayscale-0' : 'grayscale'
            } ${!isMobile ? 'group-hover:grayscale-0 group-hover/case:grayscale-0' : ''}`}
            style={{ objectPosition: beforePosition }}
            draggable={false}
          />
        </div>
      </div>

      {/* Slider Handle & Labels */}
      <div
        className="absolute top-0 bottom-0 w-[1px] bg-white cursor-ew-resize z-30 flex flex-col justify-center pointer-events-none"
        style={{ left: `${sliderPosition}%` }}
      >
        {/* Handle Circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border border-white flex items-center justify-center backdrop-blur-sm bg-white/10 shadow-lg transition-transform transform group-hover:scale-110">
          <div className="flex gap-2">
            <svg
              width="4"
              height="8"
              viewBox="0 0 4 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M3.5 1L0.5 4L3.5 7" stroke="white" />
            </svg>
            <svg
              width="4"
              height="8"
              viewBox="0 0 4 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M0.5 1L3.5 4L0.5 7" stroke="white" />
            </svg>
          </div>
        </div>

        {/* Labels attached to slider - Only visible on hover or interaction */}
        <div
          className={`absolute top-6 right-full mr-6 transition-opacity duration-500 flex items-center ${
            showLabels ? 'opacity-100' : 'opacity-0'
          } ${!isMobile ? 'group-hover:opacity-100 group-hover/case:opacity-100' : ''}`}
        >
          <div className="bg-black/30 backdrop-blur-md px-3 py-1 text-[8px] tracking-ultra font-bold uppercase text-white shadow-lg whitespace-nowrap border border-white/10">
            Before
          </div>
        </div>

        <div
          className={`absolute top-6 left-full ml-6 transition-opacity duration-500 flex items-center ${
            showLabels ? 'opacity-100' : 'opacity-0'
          } ${!isMobile ? 'group-hover:opacity-100 group-hover/case:opacity-100' : ''}`}
        >
          <div className="bg-studio-gold/90 backdrop-blur-md px-3 py-1 text-[8px] tracking-ultra font-bold uppercase text-white shadow-lg whitespace-nowrap">
            After
          </div>
        </div>
      </div>
    </div>
  );
};
