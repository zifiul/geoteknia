import 'server-only';

import DOMPurify from 'isomorphic-dompurify';

import {
  CMS_HTML_ALLOWED_ATTR,
  CMS_HTML_ALLOWED_TAGS,
} from '@/lib/content/cms-html-allowlist';

/**
 * Sanitiza HTML editorial del CMS antes de render público (GTK-55+).
 */
export function sanitizeCmsHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [...CMS_HTML_ALLOWED_TAGS],
    ALLOWED_ATTR: [...CMS_HTML_ALLOWED_ATTR],
    ALLOW_DATA_ATTR: false,
  });
}
