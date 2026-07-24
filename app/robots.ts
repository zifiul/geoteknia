import type { MetadataRoute } from 'next';

/**
 * Rutas no indexables adicionales (thank-you, etc.) se añadirán en GTK-28+.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        disallow: ['/admin', '/admin/'],
      },
    ],
  };
}
