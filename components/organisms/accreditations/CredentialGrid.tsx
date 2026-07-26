import type { PublishedAccreditationDetail } from '@/lib/content/accreditations';
import {
  CREDENTIAL_TYPE_SECTION_LABELS,
  CREDENTIAL_TYPE_SECTION_ORDER,
} from '@/lib/accreditations/page-config';

import { CredentialCard } from '@/components/organisms/accreditations/CredentialCard';

export type CredentialGridProps = {
  items: PublishedAccreditationDetail[];
};

function groupByCredentialType(
  items: PublishedAccreditationDetail[],
): Map<string, PublishedAccreditationDetail[]> {
  const map = new Map<string, PublishedAccreditationDetail[]>();
  for (const item of items) {
    const key = item.credentialType;
    const list = map.get(key) ?? [];
    list.push(item);
    map.set(key, list);
  }
  return map;
}

export function CredentialGrid({ items }: CredentialGridProps) {
  const grouped = groupByCredentialType(items);

  return (
    <div className="flex flex-col gap-12" data-testid="credential-grid">
      {CREDENTIAL_TYPE_SECTION_ORDER.map((type) => {
        const sectionItems = grouped.get(type);
        if (!sectionItems?.length) {
          return null;
        }
        const sectionId = `credential-section-${type}`;
        return (
          <section key={type} aria-labelledby={sectionId}>
            <h2
              id={sectionId}
              className="font-display text-2xl font-semibold text-brand-on-surface"
            >
              {CREDENTIAL_TYPE_SECTION_LABELS[type]}
            </h2>
            <ul className="mt-6 grid gap-6 sm:grid-cols-2">
              {sectionItems.map((item) => (
                <li key={item.id}>
                  <CredentialCard item={item} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
