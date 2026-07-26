import Image from 'next/image';

import type { PublishedAccreditationDetail } from '@/lib/content/accreditations';

import { AccreditationsVerifyLink } from '@/components/organisms/accreditations/AccreditationsVerifyLink';

export type CredentialCardProps = {
  item: PublishedAccreditationDetail;
};

export function CredentialCard({ item }: CredentialCardProps) {
  const logoAlt = item.logoAlt ?? item.name;

  return (
    <article
      className="flex h-full flex-col rounded-lg border border-brand-secondary/10 bg-brand-neutral/30 p-5"
      data-testid="credential-card"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {item.logoUrl ? (
          <div className="relative h-16 w-28 shrink-0 rounded-sm bg-brand-surface p-2">
            <Image
              src={item.logoUrl}
              alt={logoAlt}
              fill
              sizes="112px"
              className="object-contain p-1"
            />
          </div>
        ) : (
          <div
            className="flex h-16 w-28 shrink-0 items-center justify-center rounded-sm bg-brand-surface text-xs text-muted"
            aria-hidden
          >
            Sin logo
          </div>
        )}
        <div className="min-w-0 flex-1">
          {item.registrationNumber ? (
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-secondary">
              Nº {item.registrationNumber}
            </p>
          ) : null}
          <h3 className="mt-1 font-display text-lg font-semibold text-brand-on-surface">{item.name}</h3>
          {item.issuer ? (
            <p className="mt-1 text-sm text-muted">Emisor: {item.issuer}</p>
          ) : null}
        </div>
      </div>
      {item.verificationUrl ? (
        <p className="mt-4 border-t border-brand-secondary/10 pt-4">
          <AccreditationsVerifyLink
            href={item.verificationUrl}
            accreditationId={item.id}
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand-accent underline-offset-2 hover:underline"
          >
            Verificar acreditación en {item.issuer ?? 'el organismo emisor'}
          </AccreditationsVerifyLink>
        </p>
      ) : null}
    </article>
  );
}
