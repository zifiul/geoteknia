'use client';

import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';

import type { PublishedTeamMemberListItem } from '@/lib/content/team-machinery';
import { hasAnalyticsConsent, readBrowserConsent } from '@/lib/analytics/consent';
import { pushRawDataLayer } from '@/lib/analytics/datalayer';

export type TeamMemberSelectLinkProps = Omit<ComponentProps<typeof Link>, 'children'> & {
  member: PublishedTeamMemberListItem;
  children: ReactNode;
};

export function TeamMemberSelectLink({
  member,
  children,
  onClick,
  ...props
}: TeamMemberSelectLinkProps) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        const stored = readBrowserConsent();
        if (stored && hasAnalyticsConsent(stored.categories)) {
          pushRawDataLayer({
            event: 'select_item',
            item_list_id: 'team_directory',
            item_list_name: 'Directorio de equipo',
            items: [
              {
                item_id: member.id,
                item_name: member.fullName,
                item_category: member.jobTitle,
              },
            ],
          });
        }
        onClick?.(event);
      }}
    >
      {children}
    </Link>
  );
}
