'use client';

import { useEffect, useState } from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/molecules/Accordion';
import { FaqInternalLink } from '@/components/organisms/faq/FaqInternalLink';
import { hasAnalyticsConsent, readBrowserConsent } from '@/lib/analytics/consent';
import { pushRawDataLayer } from '@/lib/analytics/datalayer';
import type { PublishedFaqItem } from '@/lib/content/blog-faqs';

export type FaqAccordionProps = {
  items: PublishedFaqItem[];
};

export function faqAnchorId(faqId: string): string {
  return `faq-${faqId}`;
}

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [openValue, setOpenValue] = useState<string | undefined>(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }
    const hash = window.location.hash.replace(/^#/, '');
    if (!hash) {
      return undefined;
    }
    return items.some((item) => faqAnchorId(item.id) === hash) ? hash : undefined;
  });

  useEffect(() => {
    const hash = window.location.hash.replace(/^#/, '');
    if (!hash || !items.some((item) => faqAnchorId(item.id) === hash)) {
      return;
    }
    requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [items]);

  if (items.length === 0) {
    return null;
  }

  return (
    <Accordion
      type="single"
      collapsible
      value={openValue}
      onValueChange={(value) => {
        setOpenValue(value);
        if (!value) {
          return;
        }
        const stored = readBrowserConsent();
        if (!stored || !hasAnalyticsConsent(stored.categories)) {
          return;
        }
        const faqId = value.startsWith('faq-') ? value.slice(4) : value;
        pushRawDataLayer({
          event: 'faq_open',
          content_type: 'faq',
          content_id: faqId,
        });
      }}
      className="divide-y divide-brand-secondary/15 rounded-lg border border-brand-secondary/10 bg-brand-surface"
      data-testid="faq-accordion"
    >
      {items.map((faq) => {
        const anchorId = faqAnchorId(faq.id);
        return (
          <AccordionItem key={faq.id} value={anchorId} id={anchorId} className="border-none px-4 md:px-6">
            <AccordionTrigger className="text-base md:text-lg">{faq.question}</AccordionTrigger>
            <AccordionContent>
              <p className="whitespace-pre-line text-muted">{faq.answer}</p>
              {faq.internalLinkUrl ? (
                <FaqInternalLink href={faq.internalLinkUrl} faqId={faq.id}>
                  Ver recurso relacionado
                </FaqInternalLink>
              ) : null}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
