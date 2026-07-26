import { SchemaType } from '@prisma/client';
import { describe, expect, it } from 'vitest';

import { buildTeamMemberSeoBlock } from '@/lib/team/team-member-seo';

describe('buildTeamMemberSeoBlock (GTK-56)', () => {
  it('fija schemaType Person y noindex false', () => {
    const block = buildTeamMemberSeoBlock({
      slug: 'ana-lopez',
      fullName: 'Ana López',
      jobTitle: 'Ingeniera geotécnica',
      bio: 'Especialista en cimentaciones profundas.',
    });
    expect(block.schemaType).toBe(SchemaType.Person);
    expect(block.noindex).toBe(false);
    expect(block.slug).toBe('ana-lopez');
  });

  it('deriva title y description desde nombre, cargo y bio', () => {
    const block = buildTeamMemberSeoBlock({
      slug: 'carlos',
      fullName: 'Carlos Méndez',
      jobTitle: 'Director técnico',
      bio: 'Más de veinte años de experiencia en estudios geotécnicos integrales.',
    });
    expect(block.metaTitle).toContain('Carlos Méndez');
    expect(block.metaTitle).toContain('Director técnico');
    expect(block.metaDescription).toContain('veinte años');
    expect((block.metaDescription ?? '').length).toBeLessThanOrEqual(155);
  });

  it('usa fallback de description si no hay bio', () => {
    const block = buildTeamMemberSeoBlock({
      slug: 'x',
      fullName: 'Técnico',
      jobTitle: 'Geólogo',
      bio: null,
    });
    expect(block.metaDescription).toMatch(/Geólogo en Geoteknia/);
  });
});
