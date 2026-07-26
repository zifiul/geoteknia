import type { Metadata } from 'next';

import { ThankYouConfirmation } from '@/components/organisms/thankyou/ThankYouConfirmation';
import { THANK_YOU_CONFIG, type ThankYouKind } from '@/lib/thankyou/config';
import { buildThankYouMetadata } from '@/lib/thankyou/metadata';
import {
  sanitizeDownloadUrl,
  sanitizeReferenceParam,
} from '@/lib/thankyou/sanitize';

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export function createThankYouPage(kind: ThankYouKind) {
  const config = THANK_YOU_CONFIG[kind];

  async function generateMetadata(): Promise<Metadata> {
    return buildThankYouMetadata(
      config.metadataTitle,
      config.metadataDescription,
    );
  }

  async function ThankYouPage({ searchParams }: PageProps) {
    const params = await searchParams;
    const referenceNumber = sanitizeReferenceParam(params.ref);
    const downloadUrl =
      kind === 'recurso' ? sanitizeDownloadUrl(params.download) : null;

    return (
      <ThankYouConfirmation
        config={config}
        referenceNumber={referenceNumber}
        downloadUrl={downloadUrl}
      />
    );
  }

  return { generateMetadata, default: ThankYouPage };
}
