'use client';

import { useEffect, useRef } from 'react';

import { trackConversionEvent } from '@/lib/analytics/track';

const THRESHOLDS = [25, 50, 75, 100] as const;

export type GeoScrollDepthTrackerProps = {
  provinceSlug: string;
};

export function GeoScrollDepthTracker({ provinceSlug }: GeoScrollDepthTrackerProps) {
  const fired = useRef(new Set<number>());

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      if (scrollable <= 0) {
        return;
      }
      const percent = Math.min(100, Math.round((window.scrollY / scrollable) * 100));
      for (const threshold of THRESHOLDS) {
        if (percent >= threshold && !fired.current.has(threshold)) {
          fired.current.add(threshold);
          void trackConversionEvent({
            eventName: 'scroll_depth',
            value: threshold,
            provinceSlug,
          });
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [provinceSlug]);

  return null;
}
