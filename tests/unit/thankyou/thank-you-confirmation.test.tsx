/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ThankYouConfirmation } from '@/components/organisms/thankyou/ThankYouConfirmation';
import {
  RESPONSE_DEADLINE_COPY,
  TECHNICIAN_FALLBACK_COPY,
} from '@/lib/leads/confirmation-copy';
import { THANK_YOU_CONFIG } from '@/lib/thankyou/config';

vi.mock('@/components/organisms/thankyou/ThankYouConversionPing.client', () => ({
  ThankYouConversionPing: () => null,
}));

afterEach(() => {
  cleanup();
});

describe('ThankYouConfirmation', () => {
  const config = THANK_YOU_CONFIG.presupuesto;

  it('muestra referencia y copy de técnico/plazo compartido', () => {
    render(
      <ThankYouConfirmation
        config={config}
        referenceNumber="PRE-20260726-ABCD"
        downloadUrl={null}
      />,
    );
    expect(screen.getByTestId('thank-you-reference')).toHaveTextContent(
      'PRE-20260726-ABCD',
    );
    expect(screen.getByRole('status')).toHaveTextContent(
      TECHNICIAN_FALLBACK_COPY,
    );
    expect(screen.getByRole('status')).toHaveTextContent(
      RESPONSE_DEADLINE_COPY,
    );
  });

  it('estado neutro sin referencia', () => {
    render(
      <ThankYouConfirmation
        config={config}
        referenceNumber={null}
        downloadUrl={null}
      />,
    );
    expect(screen.queryByTestId('thank-you-reference')).toBeNull();
    expect(
      screen.getByRole('heading', { level: 1, name: config.headlineGeneric }),
    ).toBeInTheDocument();
  });

  it('enlace de descarga solo si downloadUrl presente', () => {
    const { rerender } = render(
      <ThankYouConfirmation
        config={THANK_YOU_CONFIG.recurso}
        referenceNumber="REC-20260726-WXYZ"
        downloadUrl={null}
      />,
    );
    expect(screen.queryByTestId('thank-you-download')).toBeNull();

    rerender(
      <ThankYouConfirmation
        config={THANK_YOU_CONFIG.recurso}
        referenceNumber="REC-20260726-WXYZ"
        downloadUrl="/api/recursos/download?token=abc"
      />,
    );
    expect(screen.getByTestId('thank-you-download')).toHaveAttribute(
      'href',
      '/api/recursos/download?token=abc',
    );
  });
});
