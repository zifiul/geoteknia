import type { ImageSitemapEntry } from '@/lib/seo/sitemap-sources';
import { escapeXml } from '@/lib/seo/xml-escape';

export function buildImageSitemapXml(entries: ImageSitemapEntry[]): string {
  const urls = entries
    .map((entry) => {
      const captionXml = entry.caption
        ? `<image:caption>${escapeXml(entry.caption)}</image:caption>`
        : '';
      return `<url>
  <loc>${escapeXml(entry.pageUrl)}</loc>
  <image:image>
    <image:loc>${escapeXml(entry.imageLoc)}</image:loc>
    ${captionXml}
  </image:image>
</url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>`;
}
