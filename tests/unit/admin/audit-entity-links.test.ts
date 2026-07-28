import { describe, expect, it } from 'vitest';

import { resolveAuditEntityHref } from '@/lib/admin/audit-entity-links';

const PROJECT_ID = '11111111-1111-4111-8111-111111111111';

describe('resolveAuditEntityHref (GTK-80)', () => {
  it('projects → detalle CRM admin', () => {
    expect(resolveAuditEntityHref('projects', PROJECT_ID)).toBe(
      `/admin/proyectos/${PROJECT_ID}`,
    );
  });

  it('tipo editorial sin destino GTK-73 → null', () => {
    expect(resolveAuditEntityHref('service', PROJECT_ID)).toBeNull();
    expect(resolveAuditEntityHref('blog', PROJECT_ID)).toBeNull();
  });

  it('sin entityId → null', () => {
    expect(resolveAuditEntityHref('projects', null)).toBeNull();
  });
});
