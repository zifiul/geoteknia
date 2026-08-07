import DOMPurify from 'isomorphic-dompurify';

import {
  CMS_HTML_ALLOWED_ATTR,
  CMS_HTML_ALLOWED_TAGS,
} from '@/lib/content/cms-html-allowlist';

/**
 * Sanitiza HTML editorial en componentes cliente (preview admin, FAQ accordion).
 */
export function sanitizeCmsHtmlClient(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [...CMS_HTML_ALLOWED_TAGS],
    ALLOWED_ATTR: [...CMS_HTML_ALLOWED_ATTR],
    ALLOW_DATA_ATTR: false,
  });
}
