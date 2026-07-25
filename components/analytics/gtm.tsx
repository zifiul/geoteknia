'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

import {
  readBrowserConsent,
  shouldLoadGtm,
} from '@/lib/analytics/consent';
import { CONSENT_UPDATED_EVENT } from '@/lib/analytics/consent-events';

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID?.trim();

/**
 * Bootstrap dataLayer + Consent Mode v2 denied (sin petición externa).
 */
export function GtmConsentBootstrap() {
  return (
    // Consent default debe ejecutarse antes que GTM; excepción documentada GTK-46.
    // eslint-disable-next-line @next/next/no-before-interactive-script-outside-document -- Consent Mode v2
    <Script id="gtm-consent-bootstrap" strategy="beforeInteractive">
      {`
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
`}
    </Script>
  );
}

export function GtmContainer() {
  const [loadContainer, setLoadContainer] = useState(() => {
    if (typeof window === 'undefined') return false;
    const stored = readBrowserConsent();
    return stored !== null && shouldLoadGtm(stored.categories);
  });

  useEffect(() => {
    const onUpdate = () => {
      const stored = readBrowserConsent();
      setLoadContainer(stored !== null && shouldLoadGtm(stored.categories));
    };
    window.addEventListener(CONSENT_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(CONSENT_UPDATED_EVENT, onUpdate);
  }, []);

  if (!GTM_ID || !loadContainer) {
    return null;
  }

  return (
    <>
      <Script id="gtm-loader" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
      </Script>
      <noscript>
        <iframe
          title="Google Tag Manager"
          src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
    </>
  );
}

export function GtmScript() {
  return (
    <>
      <GtmConsentBootstrap />
      <GtmContainer />
    </>
  );
}
