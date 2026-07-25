'use client';

import { Button } from '@/components/atoms/Button';
import { trackConversionEvent } from '@/lib/analytics/track';

export function DevAnalyticsTrackButton() {
  return (
    <Button
      type="button"
      data-testid="gtk46-track-test"
      onClick={() =>
        void trackConversionEvent({
          eventName: 'scroll_depth',
          value: 50,
          serviceSlug: 'dev-analytics-test',
        })
      }
    >
      Disparar evento de prueba
    </Button>
  );
}
