import { PrismaClient } from '@prisma/client';

import { looksLikeHtml, plainTextToHtml } from '@/lib/content/plaintext-to-html';

const prisma = new PrismaClient();

type MigrationStats = {
  services: number;
  geoZones: number;
  serviceZonePages: number;
  faqs: number;
  skipped: number;
};

async function migrateField(value: string): Promise<{ next: string; changed: boolean }> {
  const trimmed = value.trim();
  if (!trimmed) {
    return { next: value, changed: false };
  }
  if (looksLikeHtml(trimmed)) {
    return { next: value, changed: false };
  }
  return { next: plainTextToHtml(trimmed), changed: true };
}

async function main() {
  const stats: MigrationStats = {
    services: 0,
    geoZones: 0,
    serviceZonePages: 0,
    faqs: 0,
    skipped: 0,
  };

  const services = await prisma.service.findMany({ select: { id: true, body: true } });
  for (const service of services) {
    const { next, changed } = await migrateField(service.body);
    if (!changed) {
      stats.skipped += 1;
      continue;
    }
    await prisma.service.update({ where: { id: service.id }, data: { body: next } });
    stats.services += 1;
  }

  const zones = await prisma.geoZone.findMany({ select: { id: true, body: true } });
  for (const zone of zones) {
    const { next, changed } = await migrateField(zone.body);
    if (!changed) {
      stats.skipped += 1;
      continue;
    }
    await prisma.geoZone.update({ where: { id: zone.id }, data: { body: next } });
    stats.geoZones += 1;
  }

  const pages = await prisma.serviceZonePage.findMany({ select: { id: true, body: true } });
  for (const page of pages) {
    const { next, changed } = await migrateField(page.body);
    if (!changed) {
      stats.skipped += 1;
      continue;
    }
    await prisma.serviceZonePage.update({ where: { id: page.id }, data: { body: next } });
    stats.serviceZonePages += 1;
  }

  const faqs = await prisma.faq.findMany({ select: { id: true, answer: true } });
  for (const faq of faqs) {
    const { next, changed } = await migrateField(faq.answer);
    if (!changed) {
      stats.skipped += 1;
      continue;
    }
    await prisma.faq.update({ where: { id: faq.id }, data: { answer: next } });
    stats.faqs += 1;
  }

  console.log(JSON.stringify({ ok: true, stats }));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
