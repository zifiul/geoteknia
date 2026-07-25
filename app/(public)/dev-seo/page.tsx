import { SchemaType } from '@prisma/client';

import { JsonLd } from '@/components/seo/json-ld';
import { buildSiloBreadcrumbListSchema } from '@/lib/seo/breadcrumbs';
import { buildServiceSchema } from '@/lib/seo/jsonld';
import { buildMetadata } from '@/lib/seo/metadata';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

/** Payload de prueba SEC-1 (no debe cerrar el script en HTML). */
export const DEV_SEO_INJECTION_PROBE = '</script><img src=x onerror=alert(1)>';

const seoBlock = {
  slug: 'dev-seo-test',
  schemaType: SchemaType.Service,
  metaTitle: 'Página prueba SEO GTK-45',
  metaDescription:
    'Verificación de JSON-LD, canonical y escapado seguro para plantillas públicas.',
  noindex: true,
};

export const metadata = buildMetadata(siteUrl, 'service', seoBlock);

export default function DevSeoPage() {
  const serviceUrl = `${siteUrl.replace(/\/$/, '')}/servicios/dev-seo-test`;
  const serviceSchema = buildServiceSchema({
    name: `Servicio prueba ${DEV_SEO_INJECTION_PROBE}`,
    description: 'Contenido dinámico con caracteres peligrosos para tests E2E.',
    url: serviceUrl,
  });
  const breadcrumbSchema = buildSiloBreadcrumbListSchema(
    siteUrl,
    'service',
    { slug: 'dev-seo-test' },
    'Prueba SEO',
  );

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1>Página de prueba SEO (GTK-45)</h1>
      <p className="text-sm text-gray-600">
        Ruta interna de verificación; metadata con noindex.
      </p>
      <JsonLd data={serviceSchema} />
      <JsonLd data={breadcrumbSchema} />
    </main>
  );
}
