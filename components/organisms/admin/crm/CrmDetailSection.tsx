import type { ReactNode } from 'react';

type Props = {
  id: string;
  title: string;
  count?: number;
  defaultOpen?: boolean;
  children: ReactNode;
};

export function CrmDetailSection({
  id,
  title,
  count,
  defaultOpen = true,
  children,
}: Props) {
  const label =
    count !== undefined ? `${title} (${count})` : title;

  return (
    <details
      open={defaultOpen}
      className="group rounded-xl border border-brand-primary/10 bg-brand-surface shadow-sm"
    >
      <summary
        className="cursor-pointer list-none px-4 py-3 text-sm font-semibold text-brand-primary marker:content-none [&::-webkit-details-marker]:hidden"
        id={`${id}-heading`}
      >
        <span className="flex items-center justify-between gap-2">
          {label}
          <span
            className="text-brand-secondary transition group-open:rotate-180"
            aria-hidden
          >
            ▾
          </span>
        </span>
      </summary>
      <div className="border-t border-brand-primary/10 px-4 py-4">{children}</div>
    </details>
  );
}
