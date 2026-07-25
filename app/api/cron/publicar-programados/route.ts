import { NextResponse } from 'next/server';

import { runScheduledPublishBatch } from '@/lib/content/publish';
import { scheduledPublishCronSummarySchema } from '@/lib/content/schemas/publish';
import { verifyBearerSecret } from '@/lib/cron/verify-secret';
import { env } from '@/lib/env';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return handleCron(request);
}

export async function POST(request: Request) {
  return handleCron(request);
}

async function handleCron(request: Request) {
  const secret = env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const authorized = verifyBearerSecret(
    request.headers.get('authorization'),
    secret,
  );
  if (!authorized) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const summary = await runScheduledPublishBatch();
  const body = scheduledPublishCronSummarySchema.parse(summary);
  return NextResponse.json(body);
}
