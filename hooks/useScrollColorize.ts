import { useState, useEffect, useRef, RefObject } from 'react';

/**
 * Detect if device should use scroll-based colorization instead of hover
 * Returns true on mobile/tablet, false on desktop with mouse
 *
 * Uses multiple detection methods for maximum compatibility:
 * 1. Media queries (hover: none, pointer: coarse) - most reliable for actual devices
 * 2. Touch capability detection (ontouchstart, maxTouchPoints)
 * 3. Mobile user agent detection as fallback
 */
function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false;

  // Primary check: hover: none means device can't hover (mobile/tablet)
  const cannotHover = window.matchMedia('(hover: none)').matches;

  // Secondary check: coarse pointer (finger) as primary input
  const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

  // Touch capability check
  const hasTouchCapability = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // User agent check for mobile devices (fallback)
  const mobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  // Device should use scroll colorization if:
  // 1. Media queries indicate no hover capability
  // 2. OR has coarse pointer (touch screen)
  // 3. OR is detected as mobile via user agent AND has touch
  return cannotHover || hasCoarsePointer || (mobileUserAgent && hasTouchCapability);
}

/**
 * Hook that auto-colorizes images on scroll for touch devices only.
 * On desktop (with mouse), returns false so hover effects remain active.
 *
 * @param threshold - How much of the element should be visible (0-1, default 0.3 = 30%)
 * @param rootMargin - Margin around the viewport to trigger earlier/later
 * @returns [ref, shouldColorize] - Ref to attach to element and boolean for colorization
 */
export function useScrollColorize<T extends HTMLElement = HTMLDivElement>(
  threshold: number = 0.3,
  rootMargin: string = '0px'
): [RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [isInView, setIsInView] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  // Detect touch device on mount
  useEffect(() => {
    setIsTouch(isTouchDevice());
  }, []);

  useEffect(() => {
    // Only run intersection observer on touch devices
    if (!isTouch) return;

    const element = ref.current;
    if (!element) return;

    // Check if IntersectionObserver is available
    if (typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          // Toggle based on visibility - colorize when in view, grayscale when scrolled away
          setIsInView(entry.isIntersecting);
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin, isTouch]);

  // On desktop: always return false (let CSS hover handle it)
  // On touch: return true when in view
  return [ref, isTouch && isInView];
}

/**
 * Same as useScrollColorize but resets when element leaves viewport
 * Good for elements that appear multiple times or loop
 */
export function useScrollColorizeToggle<T extends HTMLElement = HTMLDivElement>(
  threshold: number = 0.3,
  rootMargin: string = '0px'
): [RefObject<T>, boolean] {
  const ref = useRef<T>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    if (typeof IntersectionObserver === 'undefined') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          setIsInView(entry.isIntersecting);
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin]);

  return [ref, isInView];
}

export default useScrollColorize;
