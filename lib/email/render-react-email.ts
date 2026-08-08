import 'server-only';

import type { ReactElement } from 'react';
import { render } from '@react-email/render';

export type RenderedEmail = { html: string; text: string };

/**
 * Renderiza una plantilla React Email a HTML y texto plano.
 * Resend hacía este render internamente; con un adaptador SMTP hay
 * que resolverlo antes de entregar el mensaje al transporte.
 */
export async function renderReactEmail(
  element: ReactElement,
): Promise<RenderedEmail> {
  const [html, text] = await Promise.all([
    render(element),
    render(element, { plainText: true }),
  ]);
  return { html, text };
}
