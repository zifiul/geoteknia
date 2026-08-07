'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

import {
  readBrowserConsent,
  shouldLoadGtm,
} from '@/lib/analytics/consent';
import { CONSENT_UPDATED_EVENT } from '@/lib/analytics/consent-events';

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID?.trim();

function consentAllowsGtm(): boolean {
  const stored = readBrowserConsent();
  return stored !== null && shouldLoadGtm(stored.categories);
}

export function GtmContainer() {
  const [loadContainer, setLoadContainer] = useState(false);

  useEffect(() => {
    setLoadContainer(consentAllowsGtm());

    const onUpdate = () => {
      setLoadContainer(consentAllowsGtm());
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

