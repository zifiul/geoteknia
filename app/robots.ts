import type { MetadataRoute } from 'next';

/**
 * Rutas no indexables adicionales (thank-you, etc.) se añadirán en GTK-28+.
 */
function getPublicSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim();
  if (!raw) {
    throw new Error(
      'NEXT_PUBLIC_SITE_URL (o NEXTAUTH_URL como fallback) es obligatoria para robots.txt',
    );
  }
  return raw.replace(/\/$/, '');
}

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getPublicSiteUrl();
  return {
    rules: [
      {
        userAgent: '*',
        disallow: ['/admin', '/admin/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
