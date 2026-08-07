/**
 * Bootstrap dataLayer + Consent Mode v2 denied (sin petición externa).
 *
 * Script nativo en Server Component (no next/script): React 19 no ejecuta
 * <script> renderizados por Client Components / next/script en el cliente, y
 * beforeInteractive solo es válido en el root layout. El HTML SSR ejecuta esto
 * al parsear, antes de hidratar y antes de que GtmContainer cargue GTM.
 */
export function GtmConsentBootstrap() {
  return (
    <script
      id="gtm-consent-bootstrap"
      dangerouslySetInnerHTML={{
        __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('consent', 'default', {
  ad_storage: 'denied',
  analytics_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  wait_for_update: 500
});
`,
      }}
    />
  );
}
