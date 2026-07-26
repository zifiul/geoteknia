/**
 * @vitest-environment jsdom
 */
import { render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ThankYouConversionPing } from '@/components/organisms/thankyou/ThankYouConversionPing.client';
import { THANK_YOU_SESSION_KEY_PREFIX } from '@/lib/thankyou/config';

const pushDataLayerMock = vi.hoisted(() => vi.fn(() => true));

vi.mock('@/lib/analytics/datalayer', () => ({
  pushDataLayer: pushDataLayerMock,
}));

describe('ThankYouConversionPing', () => {
  beforeEach(() => {
    pushDataLayerMock.mockClear();
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('no dispara sin referencia', async () => {
    render(
      <ThankYouConversionPing
        referenceNumber={null}
        eventName="generate_lead"
        leadType="presupuesto"
      />,
    );
    await waitFor(() => {
      expect(pushDataLayerMock).not.toHaveBeenCalled();
    });
  });

  it('dispara una vez y marca sessionStorage', async () => {
    render(
      <ThankYouConversionPing
        referenceNumber="PRE-20260726-ABCD"
        eventName="generate_lead"
        leadType="presupuesto"
      />,
    );
    await waitFor(() => {
      expect(pushDataLayerMock).toHaveBeenCalledTimes(1);
    });
    expect(
      sessionStorage.getItem(`${THANK_YOU_SESSION_KEY_PREFIX}PRE-20260726-ABCD`),
    ).toBe('1');
  });

  it('no repite si sessionStorage ya marcado', async () => {
    sessionStorage.setItem(
      `${THANK_YOU_SESSION_KEY_PREFIX}PRE-20260726-ABCD`,
      '1',
    );
    render(
      <ThankYouConversionPing
        referenceNumber="PRE-20260726-ABCD"
        eventName="generate_lead"
        leadType="presupuesto"
      />,
    );
    await waitFor(() => {
      expect(pushDataLayerMock).not.toHaveBeenCalled();
    });
  });
});
