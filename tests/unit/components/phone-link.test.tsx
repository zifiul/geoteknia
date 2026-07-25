/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { PhoneLink } from '@/components/molecules/PhoneLink';

vi.mock('@/lib/analytics/track', () => ({
  trackConversionEvent: vi.fn(),
}));

describe('PhoneLink', () => {
  it('renderiza enlace tel: con dígitos normalizados', () => {
    render(<PhoneLink phone="+34 900 000 000" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'tel:34900000000');
  });
});
