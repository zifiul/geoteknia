import { POST } from '../app/api/recursos/[slug]/route';
import { NextRequest } from 'next/server';

async function run() {
  process.env.TURNSTILE_SECRET_KEY = '1x0000000000000000000000000000000AA';
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = '1x00000000000000000000AA';
  process.env.RESEND_API_KEY = 're_test';
  process.env.EMAIL_FROM = 'Geoteknia <noreply@test.com>';
  process.env.EMAIL_REPLY_TO = 'presupuestos@test.com';

  const req = new NextRequest('http://localhost:3000/api/recursos/guia-curl-gtk30-1784965211136', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      nombre: 'Curl Tester',
      email: 'curl.tester@example.com',
      empresa: 'Curl Corp',
      gdprConsent: true,
      turnstileToken: '1x00000000000000000000AA'
    })
  });

  const res = await POST(req, { params: Promise.resolve({ slug: 'guia-curl-gtk30-1784965211136' }) });
  console.log('STATUS:', res.status);
  console.log('BODY:', JSON.stringify(await res.json()));
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
